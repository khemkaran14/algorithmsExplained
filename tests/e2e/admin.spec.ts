import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
test('admin role is checked freshly and filtered coupon controls cannot change an ordinary account’s permissions', async ({
  page,
  context,
  request,
}) => {
  test.skip(!process.env.DATABASE_URL, 'Requires PostgreSQL.');
  const db = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    }),
    id = randomUUID(),
    token = randomUUID(),
    code = 'ADM_' + randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase();
  let couponId = '';
  try {
    await db.user.create({
      data: {
        id,
        email: `${code}@example.com`,
        sessions: {
          create: {
            sessionToken: token,
            expires: new Date(Date.now() + 3600000),
          },
        },
      },
    });
    const coupon = await db.coupon.create({
      data: {
        code,
        kind: 'percent',
        value: 10,
        maxUses: 5,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
    couponId = coupon.id;
    expect(
      (
        await request.patch('/api/admin/coupons', {
          data: { id: couponId, active: false },
          headers: { Origin: 'http://127.0.0.1:3000' },
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
      (
        await context.request.patch('/api/admin/coupons', {
          data: { id: couponId, active: false },
          headers: { Origin: 'http://127.0.0.1:3000' },
        })
      ).status(),
    ).toBe(403);
    await db.user.update({ where: { id }, data: { role: 'admin' } });
    await page.goto(`/admin?q=${code}`);
    await expect(
      page.getByRole('heading', { name: 'Administration', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Content free-ratio report' }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: `Disable ${code}`, exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: `Enable ${code}`, exact: true }),
    ).toBeVisible();
    expect(
      (await db.coupon.findUnique({ where: { id: couponId } }))?.active,
    ).toBe(false);
    await db.user.update({ where: { id }, data: { role: 'user' } });
    expect(
      (
        await context.request.patch('/api/admin/coupons', {
          data: { id: couponId, active: true },
          headers: { Origin: 'http://127.0.0.1:3000' },
        })
      ).status(),
    ).toBe(403);
  } finally {
    if (couponId) await db.coupon.deleteMany({ where: { id: couponId } });
    await db.user.deleteMany({ where: { id } });
    await db.$disconnect();
  }
});
