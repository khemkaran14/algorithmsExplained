import 'server-only';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { ApiError } from '@/lib/http';
import { PRICING } from '@/config/pricing';
import { createProviderOrder, type ProviderPayment } from './provider';
import {
  discountedAmount,
  paymentTransition,
  type PaymentStatus,
} from './security';
export const checkoutSchema = z.object({
  idempotencyKey: z.uuid(),
  coupon: z
    .string()
    .trim()
    .max(32)
    .regex(/^[A-Za-z0-9_-]*$/)
    .optional(),
});
export async function createOrder(
  userId: string,
  input: z.infer<typeof checkoutSchema>,
) {
  return db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`checkout:${userId}`}))`;
      if (
        await tx.entitlement.findFirst({
          where: { userId, type: 'ALL_ACCESS', revokedAt: null },
        })
      )
        throw new ApiError(409, 'Your account already has lifetime access.');
      const receipt =
        'av_' +
        createHash('sha256')
          .update(`${userId}:${input.idempotencyKey}`)
          .digest('hex')
          .slice(0, 32);
      const existing = await tx.payment.findUnique({ where: { receipt } });
      if (existing?.razorpayOrderId && existing.status === 'created')
        return existing;
      if (existing) throw new ApiError(409, 'Start a new checkout attempt.');
      let coupon = null;
      if (input.coupon) {
        coupon = await tx.coupon.findUnique({
          where: { code: input.coupon.toUpperCase() },
        });
        if (
          !coupon ||
          !coupon.active ||
          coupon.expiresAt <= new Date() ||
          coupon.usedCount >= coupon.maxUses
        )
          throw new ApiError(400, 'This coupon is unavailable.');
        const reserved = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            usedCount: { lt: coupon.maxUses },
            active: true,
            expiresAt: { gt: new Date() },
          },
          data: { usedCount: { increment: 1 } },
        });
        if (reserved.count !== 1)
          throw new ApiError(
            409,
            'The last use of this coupon was just claimed.',
          );
      }
      const amount = discountedAmount(PRICING.amountPaise, coupon);
      const payment = await tx.payment.create({
        data: {
          userId,
          receipt,
          amount,
          currency: PRICING.currency,
          status: 'initializing',
          couponId: coupon?.id,
        },
      });
      const order = await createProviderOrder(amount, receipt, userId);
      if (order.amount !== amount || order.currency !== PRICING.currency)
        throw new ApiError(
          502,
          'The provider returned inconsistent order details.',
        );
      return tx.payment.update({
        where: { id: payment.id },
        data: { razorpayOrderId: order.id, status: 'created' },
      });
    },
    { timeout: 20000 },
  );
}
async function applyPayment(
  tx: Prisma.TransactionClient,
  provider: ProviderPayment,
  event: 'captured' | 'failed' | 'refunded',
) {
  const initial = await tx.payment.findUnique({
    where: { razorpayOrderId: provider.order_id },
  });
  if (!initial) throw new ApiError(503, 'Payment order is not available yet.');
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`payment:${initial.id}`}))`;
  const saved = (await tx.payment.findUnique({ where: { id: initial.id } }))!;
  if (
    event === 'failed' &&
    ['paid', 'refund-pending', 'refunded'].includes(saved.status)
  )
    return saved.id;
  if (saved.amount !== provider.amount || saved.currency !== provider.currency)
    throw new ApiError(
      400,
      'Payment amount or currency does not match the order.',
    );
  if (
    saved.razorpayPaymentId &&
    saved.razorpayPaymentId !== provider.id &&
    event !== 'failed'
  )
    throw new ApiError(
      409,
      'This order already has a different captured payment.',
    );
  const status = paymentTransition(saved.status as PaymentStatus, event);
  if (status === 'paid' || status === 'refund-pending') {
    if (provider.status !== 'captured')
      throw new ApiError(400, 'Payment is not captured.');
    await tx.payment.update({
      where: { id: saved.id },
      data: {
        status,
        razorpayPaymentId: provider.id,
        paidAt: saved.paidAt ?? new Date(),
      },
    });
    if (saved.userId)
      await tx.entitlement.upsert({
        where: { paymentId: saved.id },
        create: {
          userId: saved.userId,
          type: 'ALL_ACCESS',
          source: 'razorpay',
          paymentId: saved.id,
        },
        update: {},
      });
    await tx.emailReceipt.upsert({
      where: { paymentId: saved.id },
      create: { paymentId: saved.id },
      update: {},
    });
  } else if (status === 'refunded') {
    await tx.payment.update({
      where: { id: saved.id },
      data: {
        status,
        razorpayPaymentId: saved.razorpayPaymentId ?? provider.id,
        refundedAt: saved.refundedAt ?? new Date(),
      },
    });
    await tx.entitlement.updateMany({
      where: { paymentId: saved.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (
      saved.userId &&
      !(await tx.entitlement.findFirst({
        where: { userId: saved.userId, type: 'ALL_ACCESS', revokedAt: null },
      }))
    )
      await tx.certificate.updateMany({
        where: { userId: saved.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
  } else if (saved.status !== 'paid' && saved.status !== 'refund-pending')
    await tx.payment.update({ where: { id: saved.id }, data: { status } });
  return saved.id;
}
export async function capturePayment(provider: ProviderPayment) {
  return db.$transaction((tx) => applyPayment(tx, provider, 'captured'));
}
export async function processPaymentEvent(
  eventId: string,
  type: string,
  provider: ProviderPayment,
  event: 'captured' | 'failed' | 'refunded',
) {
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`event:${eventId}`}))`;
    if (await tx.webhookEvent.findUnique({ where: { id: eventId } }))
      return { duplicate: true };
    const paymentId = await applyPayment(tx, provider, event);
    await tx.webhookEvent.create({ data: { id: eventId, type } });
    return { duplicate: false, paymentId };
  });
}
