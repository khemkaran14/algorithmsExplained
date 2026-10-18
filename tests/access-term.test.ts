// @vitest-environment node
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, expect, it, vi } from 'vitest';
import { accessExpiry, activeAccess } from '@/payments/term';
vi.mock('@/payments/provider', () => ({
  createProviderOrder: vi.fn(async (amount: number) => ({
    id: `order_${randomUUID().replaceAll('-', '')}`,
    amount,
    currency: 'INR',
    status: 'created',
  })),
}));
import { db } from '@/lib/db';
import { capturePayment, createOrder } from '@/payments/service';

it('uses five UTC calendar years and clamps leap days without mutating the start', () => {
  const start = new Date('2024-02-29T18:45:12.123Z');
  expect(accessExpiry(start).toISOString()).toBe('2029-02-28T18:45:12.123Z');
  expect(start.toISOString()).toBe('2024-02-29T18:45:12.123Z');
  expect(accessExpiry(new Date('2026-10-18T00:00:00Z')).toISOString()).toBe(
    '2031-10-18T00:00:00.000Z',
  );
});

afterAll(() => db.$disconnect());
it.skipIf(!process.env.DATABASE_URL)(
  'dates new accounts, expires access at the boundary and permits a fresh renewal without extending a replayed grant',
  async () => {
    const user = await db.user.create({
      data: { email: `term-${randomUUID()}@example.com` },
    });
    const started = Date.now();
    try {
      expect(user.createdAt).toBeInstanceOf(Date);
      const order = await createOrder(user.id, {
        idempotencyKey: randomUUID(),
      });
      const provider = {
        id: `pay_${randomUUID().replaceAll('-', '')}`,
        order_id: order.razorpayOrderId!,
        amount: order.amount,
        currency: order.currency,
        status: 'captured',
      };
      await capturePayment(provider);
      const grant = await db.entitlement.findUniqueOrThrow({
        where: { paymentId: order.id },
      });
      expect(grant.grantedAt.getTime()).toBeGreaterThanOrEqual(started);
      expect(grant.expiresAt).toEqual(accessExpiry(grant.grantedAt));
      await expect(
        createOrder(user.id, { idempotencyKey: randomUUID() }),
      ).rejects.toThrow('already has five-year access');
      await capturePayment(provider);
      expect(
        (
          await db.entitlement.findUniqueOrThrow({
            where: { paymentId: order.id },
          })
        ).expiresAt,
      ).toEqual(grant.expiresAt);
      expect(
        await db.entitlement.count({
          where: activeAccess(user.id, new Date(grant.expiresAt.getTime() - 1)),
        }),
      ).toBe(1);
      expect(
        await db.entitlement.count({
          where: activeAccess(user.id, grant.expiresAt),
        }),
      ).toBe(0);
      await db.entitlement.update({
        where: { id: grant.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      await capturePayment(provider);
      expect(await db.entitlement.count({ where: activeAccess(user.id) })).toBe(
        0,
      );
      const renewal = await createOrder(user.id, {
        idempotencyKey: randomUUID(),
      });
      expect(renewal.id).not.toBe(order.id);
      await capturePayment({
        ...provider,
        id: `pay_${randomUUID().replaceAll('-', '')}`,
        order_id: renewal.razorpayOrderId!,
      });
      expect(await db.entitlement.count({ where: activeAccess(user.id) })).toBe(
        1,
      );
    } finally {
      await db.emailReceipt.deleteMany({
        where: { payment: { userId: user.id } },
      });
      await db.entitlement.deleteMany({ where: { userId: user.id } });
      await db.payment.deleteMany({ where: { userId: user.id } });
      await db.user.delete({ where: { id: user.id } });
    }
  },
);
it.skipIf(!process.env.DATABASE_URL)(
  'migration preserves unknown signup dates and backdates historical expiry from the original grant',
  async () => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    const schema = `term_${randomUUID().replaceAll('-', '')}`;
    try {
      await client.query(`CREATE SCHEMA "${schema}"`);
      await client.query(`SET search_path TO "${schema}"`);
      await client.query(
        'CREATE TABLE "User" (id TEXT PRIMARY KEY); CREATE TABLE "Entitlement" (id TEXT PRIMARY KEY,"userId" TEXT,type TEXT,"revokedAt" TIMESTAMP(3),"grantedAt" TIMESTAMP(3));',
      );
      await client.query(
        `INSERT INTO "User" VALUES ('legacy'); INSERT INTO "Entitlement" VALUES ('old','legacy','ALL_ACCESS',NULL,'2024-02-29 18:45:12.123');`,
      );
      await client.query(
        await readFile(
          'prisma/migrations/20261018120000_five_year_access/migration.sql',
          'utf8',
        ),
      );
      expect(
        (await client.query('SELECT "createdAt" FROM "User"')).rows[0]
          .createdAt,
      ).toBeNull();
      expect(
        (await client.query(`SELECT "expiresAt"::text FROM "Entitlement"`))
          .rows[0].expiresAt,
      ).toBe('2029-02-28 18:45:12.123');
      await client.query(`INSERT INTO "User" (id) VALUES ('new')`);
      expect(
        (
          await client.query(
            `SELECT "createdAt" IS NOT NULL AS recorded FROM "User" WHERE id='new'`,
          )
        ).rows[0].recorded,
      ).toBe(true);
    } finally {
      await client.query('SET search_path TO public');
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      client.release();
      await pool.end();
    }
  },
);
