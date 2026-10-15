import { createHmac, timingSafeEqual } from 'node:crypto';
export function validSignature(
  message: string,
  signature: string,
  secret: string,
) {
  if (!/^[a-f0-9]{64}$/i.test(signature) || !secret) return false;
  const expected = createHmac('sha256', secret).update(message).digest();
  const given = Buffer.from(signature, 'hex');
  return given.length === expected.length && timingSafeEqual(given, expected);
}
export function discountedAmount(
  base: number,
  coupon: { kind: string; value: number } | null,
) {
  if (!Number.isSafeInteger(base) || base < 100)
    throw new Error('Invalid base amount');
  if (!coupon) return base;
  if (!Number.isSafeInteger(coupon.value) || coupon.value <= 0)
    throw new Error('Invalid coupon');
  if (coupon.kind === 'percent' && coupon.value >= 100)
    throw new Error('Percentage discount must be below 100');
  if (!['percent', 'flat'].includes(coupon.kind))
    throw new Error('Unknown coupon type');
  const discount =
    coupon.kind === 'percent'
      ? Math.floor((base * coupon.value) / 100)
      : coupon.value;
  if (discount > base - 100)
    throw new Error('Discount leaves an invalid payment amount');
  return base - discount;
}
export type PaymentStatus =
  | 'initializing'
  | 'created'
  | 'failed'
  | 'paid'
  | 'refund-pending'
  | 'refunded';
export function paymentTransition(
  status: PaymentStatus,
  event: 'captured' | 'failed' | 'refunded',
): PaymentStatus {
  if (status === 'refunded') return 'refunded';
  if (event === 'refunded') return 'refunded';
  if (event === 'captured')
    return status === 'refund-pending' ? 'refund-pending' : 'paid';
  if (status === 'paid' || status === 'refund-pending') return status;
  return 'failed';
}
