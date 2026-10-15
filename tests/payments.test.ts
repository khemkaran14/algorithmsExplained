// @vitest-environment node
import { createHmac, randomUUID } from 'node:crypto';
import { describe, it, expect, vi, afterAll } from 'vitest';
import {
  validSignature,
  discountedAmount,
  paymentTransition,
} from '@/payments/security';
vi.mock('@/payments/provider', () => ({
  createProviderOrder: vi.fn(async (amount: number) => ({
    id: `order_${randomUUID().replaceAll('-', '')}`,
    amount,
    currency: 'INR',
    status: 'created',
  })),
}));
import { db } from '@/lib/db';
import { createOrder, processPaymentEvent } from '@/payments/service';
import { createProviderOrder } from '@/payments/provider';
it('verifies exact HMAC bytes and rejects malformed signatures', () => {
  const secret = 'test-only-fixture-secret',
    message = 'order_123|pay_456';
  const signature = createHmac('sha256', secret).update(message).digest('hex');
  expect(validSignature(message, signature, secret)).toBe(true);
  expect(validSignature(message + 'x', signature, secret)).toBe(false);
  expect(validSignature(message, 'x', secret)).toBe(false);
  expect(validSignature(message, signature.slice(2), secret)).toBe(false);
});
it('derives discounts from integer server prices', () => {
  expect(discountedAmount(19900, { kind: 'percent', value: 10 })).toBe(17910);
  expect(discountedAmount(19900, { kind: 'flat', value: 9900 })).toBe(10000);
  expect(() =>
    discountedAmount(19900, { kind: 'percent', value: 100 }),
  ).toThrow();
  expect(() =>
    discountedAmount(19900, { kind: 'flat', value: 19900 }),
  ).toThrow();
});
it('refunds are terminal and late failure events cannot downgrade paid orders', () => {
  expect(paymentTransition('paid', 'failed')).toBe('paid');
  expect(paymentTransition('refunded', 'captured')).toBe('refunded');
  expect(paymentTransition('created', 'failed')).toBe('failed');
  expect(paymentTransition('failed', 'captured')).toBe('paid');
  expect(paymentTransition('refund-pending', 'captured')).toBe(
    'refund-pending',
  );
});
describe.skipIf(!process.env.DATABASE_URL)(
  'transactional payment ledger',
  () => {
    afterAll(() => db.$disconnect());
    it('deduplicates events, grants once, revokes refunds, and rejects a late resurrection', async () => {
      const user = await db.user.create({
        data: { email: `payment-${randomUUID()}@example.com` },
      });
      const order = `order_${randomUUID().replaceAll('-', '')}`,
        paymentId = `pay_${randomUUID().replaceAll('-', '')}`,
        receipt = randomUUID();
      const payment = await db.payment.create({
        data: {
          userId: user.id,
          receipt,
          razorpayOrderId: order,
          amount: 19900,
          status: 'created',
        },
      });
      const provider = {
        id: paymentId,
        order_id: order,
        amount: 19900,
        currency: 'INR',
        status: 'captured',
      };
      const eventId = `evt_${randomUUID()}`;
      try {
        const results = await Promise.all([
          processPaymentEvent(
            eventId,
            'payment.captured',
            provider,
            'captured',
          ),
          processPaymentEvent(
            eventId,
            'payment.captured',
            provider,
            'captured',
          ),
        ]);
        expect(results.filter((r) => r.duplicate)).toHaveLength(1);
        expect(
          await db.entitlement.count({
            where: { paymentId: payment.id, revokedAt: null },
          }),
        ).toBe(1);
        await processPaymentEvent(
          eventId + '_failed',
          'payment.failed',
          { ...provider, status: 'failed' },
          'failed',
        );
        expect(
          (await db.payment.findUnique({ where: { id: payment.id } }))?.status,
        ).toBe('paid');
        await processPaymentEvent(
          eventId + '_refunded',
          'refund.processed',
          { ...provider, status: 'refunded' },
          'refunded',
        );
        expect(
          await db.entitlement.count({
            where: { paymentId: payment.id, revokedAt: null },
          }),
        ).toBe(0);
        await processPaymentEvent(
          eventId + '_late',
          'payment.captured',
          provider,
          'captured',
        );
        expect(
          (await db.payment.findUnique({ where: { id: payment.id } }))?.status,
        ).toBe('refunded');
        expect(
          await db.entitlement.count({
            where: { paymentId: payment.id, revokedAt: null },
          }),
        ).toBe(0);
        await expect(
          processPaymentEvent(
            eventId + '_mismatch',
            'payment.captured',
            { ...provider, amount: 1 },
            'captured',
          ),
        ).rejects.toThrow('amount or currency');
      } finally {
        await db.emailReceipt.deleteMany({ where: { paymentId: payment.id } });
        await db.entitlement.deleteMany({ where: { paymentId: payment.id } });
        await db.payment.delete({ where: { id: payment.id } });
        await db.user.delete({ where: { id: user.id } });
        await db.webhookEvent.deleteMany({
          where: { id: { startsWith: eventId } },
        });
      }
    });
    it('reuses checkout orders and reserves limited coupons only once', async () => {
      const user = await db.user.create({
        data: { email: `coupon-${randomUUID()}@example.com` },
      });
      const code = `T${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
      const coupon = await db.coupon.create({
        data: {
          code,
          kind: 'percent',
          value: 10,
          expiresAt: new Date(Date.now() + 3600000),
          maxUses: 1,
        },
      });
      const key = randomUUID();
      try {
        const first = await createOrder(user.id, {
          idempotencyKey: key,
          coupon: code,
        });
        const second = await createOrder(user.id, {
          idempotencyKey: key,
          coupon: code,
        });
        expect(first.id).toBe(second.id);
        expect(first.amount).toBe(17910);
        expect(
          (await db.coupon.findUnique({ where: { id: coupon.id } }))?.usedCount,
        ).toBe(1);
        expect(createProviderOrder).toHaveBeenCalledTimes(1);
        await expect(
          createOrder(user.id, { idempotencyKey: randomUUID(), coupon: code }),
        ).rejects.toThrow('unavailable');
      } finally {
        await db.payment.deleteMany({ where: { userId: user.id } });
        await db.coupon.delete({ where: { id: coupon.id } });
        await db.user.delete({ where: { id: user.id } });
      }
    });
  },
);
