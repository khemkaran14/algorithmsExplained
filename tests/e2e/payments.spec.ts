import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID, createHmac } from 'node:crypto';
import { loadEnvFile } from 'node:process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
try {
  loadEnvFile('.env');
} catch {}
const privateNarration = 'Two sorted streams become one ordered sequence.';
test('paid content stays out of anonymous HTML, frames, quizzes, and public JavaScript', async ({
  page,
  request,
}) => {
  const response = await request.get('/learn/dsa/sorting/merge-sort');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).not.toContain(privateNarration);
  expect(html).not.toContain('function mergeSort');
  await page.goto('/learn/dsa/sorting/merge-sort');
  await expect(
    page.getByRole('link', { name: 'Unlock everything for ₹199' }),
  ).toBeVisible();
  const frames = await request.post('/api/lessons/merge-sort/frames', {
    headers: { Origin: 'http://127.0.0.1:3000' },
    data: { input: [3, 2, 1] },
  });
  expect(frames.status()).toBe(403);
  expect(await frames.text()).not.toContain(privateNarration);
  async function scan(dir: string): Promise<void> {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await scan(file);
      else if (file.endsWith('.js'))
        expect(await readFile(file, 'utf8')).not.toContain(privateNarration);
    }
  }
  await scan(path.join(process.cwd(), '.next/static'));
});
test('a signed captured webhook grants access once, while an invalid signature grants nothing', async ({
  page,
  context,
  request,
}) => {
  test.skip(!process.env.DATABASE_URL, 'Requires PostgreSQL.');
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const id = randomUUID(),
    token = randomUUID(),
    order = `order_${randomUUID().replaceAll('-', '')}`,
    pay = `pay_${randomUUID().replaceAll('-', '')}`,
    eventId = `e2e_${randomUUID()}`;
  let paymentId: string | undefined;
  try {
    await db.user.create({
      data: {
        id,
        email: `capture-${id}@example.com`,
        sessions: {
          create: {
            sessionToken: token,
            expires: new Date(Date.now() + 3600000),
          },
        },
      },
    });
    const payment = await db.payment.create({
      data: {
        userId: id,
        receipt: randomUUID(),
        razorpayOrderId: order,
        amount: 19900,
        status: 'created',
      },
    });
    paymentId = payment.id;
    const raw = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: pay,
            order_id: order,
            amount: 19900,
            currency: 'INR',
            status: 'captured',
          },
        },
      },
    });
    const url = '/api/webhooks/razorpay';
    const invalid = await request.post(url, {
      data: raw,
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-event-id': eventId,
        'x-razorpay-signature': '0'.repeat(64),
      },
    });
    expect(invalid.status()).toBe(400);
    expect(await db.entitlement.count({ where: { userId: id } })).toBe(0);
    const signature = createHmac(
      'sha256',
      'e2e-fixture-webhook-secret-not-for-production',
    )
      .update(raw)
      .digest('hex');
    const headers = {
      'Content-Type': 'application/json',
      'x-razorpay-event-id': eventId,
      'x-razorpay-signature': signature,
    };
    expect((await request.post(url, { data: raw, headers })).status()).toBe(
      200,
    );
    const replay = await request.post(url, { data: raw, headers });
    expect(await replay.json()).toMatchObject({ duplicate: true });
    expect(
      await db.entitlement.count({ where: { userId: id, revokedAt: null } }),
    ).toBe(1);
    await context.addCookies([
      {
        name: 'authjs.session-token',
        value: token,
        url: 'http://127.0.0.1:3000',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
    await page.goto('/learn/dsa/sorting/merge-sort');
    await expect(page.getByLabel('Interactive lesson player')).toBeVisible();
    await expect(
      page.locator('p[aria-live]').filter({ hasText: privateNarration }),
    ).toBeVisible();
    const invoice = await page.request.get(`/api/invoices/${payment.id}`);
    expect(invoice.status()).toBe(200);
    expect(invoice.headers()['content-type']).toContain('application/pdf');
    expect((await invoice.body()).subarray(0, 4).toString()).toBe('%PDF');
  } finally {
    if (paymentId) {
      await db.emailReceipt.deleteMany({ where: { paymentId } });
      await db.entitlement.deleteMany({ where: { paymentId } });
      await db.payment.deleteMany({ where: { id: paymentId } });
    }
    await db.webhookEvent.deleteMany({ where: { id: eventId } });
    await db.user.deleteMany({ where: { id } });
    await db.$disconnect();
  }
});
