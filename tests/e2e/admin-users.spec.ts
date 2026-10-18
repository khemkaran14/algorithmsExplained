import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

test('admin can find payment email and inspect a user while non-admins cannot read the details', async ({
  page,
  context,
}) => {
  test.skip(!process.env.DATABASE_URL, 'Requires PostgreSQL.');
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const admin = randomUUID(),
    customer = randomUUID(),
    token = randomUUID();
  const email = `customer-${customer}@example.com`,
    billing = `billing-${customer}@example.com`;
  let paymentId: string | undefined;
  try {
    await db.user.create({
      data: {
        id: admin,
        email: `admin-${admin}@example.com`,
        sessions: {
          create: {
            sessionToken: token,
            expires: new Date(Date.now() + 3600000),
          },
        },
      },
    });
    await db.user.create({
      data: {
        id: customer,
        name: 'Customer fixture',
        email,
        emailVerified: new Date(),
        accounts: {
          create: {
            provider: 'google',
            type: 'oauth',
            providerAccountId: customer,
            access_token: 'private-admin-oauth-token',
          },
        },
      },
    });
    const payment = await db.payment.create({
      data: {
        userId: customer,
        receipt: `admin-user-${customer}`,
        paymentEmail: billing,
        amount: 19900,
        status: 'paid',
        paidAt: new Date(),
        razorpayPaymentId: `pay_${customer.replaceAll('-', '')}`,
      },
    });
    paymentId = payment.id;
    await db.entitlement.create({
      data: { userId: customer, source: 'razorpay', paymentId },
    });
    const anonymous = await context.request.get(`/admin/users/${customer}`);
    expect(await anonymous.text()).not.toContain(billing);
    expect(
      (
        await context.request.post('/api/admin/payments/email', {
          headers: { Origin: 'http://127.0.0.1:3000' },
          data: { paymentId },
        })
      ).status(),
    ).toBe(401);
    await context.addCookies([
      {
        name: 'authjs.session-token',
        value: token,
        url: 'http://127.0.0.1:3000',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
    expect(
      await (await context.request.get(`/admin/users/${customer}`)).text(),
    ).not.toContain(billing);
    await db.user.update({ where: { id: admin }, data: { role: 'admin' } });
    const response = await page.goto(`/admin?q=${billing}`);
    await expect(
      page.getByRole('heading', { name: 'Administration', exact: true }),
    ).toBeVisible();
    await expect(page.getByText(billing, { exact: true })).toBeVisible();
    await expect(
      page.getByText('Five-year active', { exact: true }),
    ).toBeVisible();
    expect(await response!.text()).not.toContain('private-admin-oauth-token');
    await expect(
      page.getByRole('button', { name: 'Create coupon', exact: true }),
    ).toBeEnabled();
    await page.getByRole('link', { name: /Customer fixture/ }).click();
    await page.waitForURL(`**/admin/users/${customer}`);
    await expect(
      page.getByRole('heading', { name: 'User details', exact: true }),
    ).toBeVisible();
    await expect(page.getByText(email, { exact: true })).toBeVisible();
    await expect(page.getByText(billing, { exact: true })).toBeVisible();
    expect(await page.content()).not.toContain('private-admin-oauth-token');
    await db.user.update({ where: { id: admin }, data: { role: 'user' } });
    expect(
      await (await context.request.get(`/admin/users/${customer}`)).text(),
    ).not.toContain(billing);
  } finally {
    if (paymentId) await db.payment.deleteMany({ where: { id: paymentId } });
    await db.user.deleteMany({ where: { id: { in: [admin, customer] } } });
    await db.$disconnect();
  }
});

test('five-year tiles are included across catalogs and relock after access expiry', async ({
  page,
  context,
}) => {
  test.skip(!process.env.DATABASE_URL, 'Requires PostgreSQL.');
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const id = randomUUID(),
    token = randomUUID();
  try {
    await db.user.create({
      data: {
        id,
        email: `tile-${id}@example.com`,
        sessions: {
          create: {
            sessionToken: token,
            expires: new Date(Date.now() + 3600000),
          },
        },
        entitlements: { create: { source: 'fixture' } },
      },
    });
    await context.addCookies([
      {
        name: 'authjs.session-token',
        value: token,
        url: 'http://127.0.0.1:3000',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
    for (const url of [
      '/learn/dsa/sorting',
      '/learn/dsa',
      '/paths/dsa-interviews',
      '/learn',
      '/account',
    ]) {
      await page.goto(url);
      await expect(
        page.getByLabel('Included in your five-year access').first(),
      ).toBeVisible();
      await expect(page.getByLabel('Requires five-year access')).toHaveCount(0);
    }
    await db.entitlement.updateMany({
      where: { userId: id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await page.goto('/account');
    await expect(
      page.getByText('Your paid access has ended.', { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Get five-year access' }),
    ).toBeVisible();
    await page.goto('/learn/dsa/sorting');
    await expect(
      page.getByLabel('Requires five-year access').first(),
    ).toBeVisible();
    await expect(
      page.getByLabel('Included in your five-year access'),
    ).toHaveCount(0);
    expect(
      (
        await context.request.post('/api/lessons/merge-sort/frames', {
          headers: { Origin: 'http://127.0.0.1:3000' },
          data: { input: [3, 2, 1] },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await context.request.post('/api/quiz', {
          headers: { Origin: 'http://127.0.0.1:3000' },
          data: { slug: 'merge-sort', answers: {}, submissionId: randomUUID() },
        })
      ).status(),
    ).toBe(403);
  } finally {
    await db.user.deleteMany({ where: { id } });
    await db.$disconnect();
  }
});
