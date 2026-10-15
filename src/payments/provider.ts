import 'server-only';
import { z } from 'zod';
import { ApiError } from '@/lib/http';
const orderSchema = z.object({
  id: z.string().startsWith('order_'),
  amount: z.number().int(),
  currency: z.literal('INR'),
  status: z.string(),
});
const paymentSchema = z.object({
  id: z.string().startsWith('pay_'),
  order_id: z.string(),
  amount: z.number().int(),
  currency: z.string(),
  status: z.string(),
});
export type ProviderPayment = z.infer<typeof paymentSchema>;
export function paymentKeys() {
  const key = process.env.RAZORPAY_KEY_ID,
    secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key || !secret)
    throw new ApiError(503, 'Payments are not configured yet.');
  return { key, secret };
}
async function provider(path: string, method = 'GET', body?: unknown) {
  const { key, secret } = paymentKeys();
  const result = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  });
  if (!result.ok)
    throw new ApiError(
      502,
      'The payment provider could not complete the request. Please retry.',
    );
  return result.json() as Promise<unknown>;
}
export async function createProviderOrder(
  amount: number,
  receipt: string,
  userId: string,
) {
  return orderSchema.parse(
    await provider('orders', 'POST', {
      amount,
      currency: 'INR',
      receipt,
      notes: { userId },
      payment_capture: 1,
    }),
  );
}
export async function fetchProviderPayment(paymentId: string) {
  if (!/^pay_[a-zA-Z0-9]+$/.test(paymentId))
    throw new ApiError(400, 'Invalid payment identifier.');
  return paymentSchema.parse(await provider(`payments/${paymentId}`));
}
export async function refundProviderPayment(
  paymentId: string,
  receipt: string,
) {
  if (!/^pay_[a-zA-Z0-9]+$/.test(paymentId))
    throw new ApiError(400, 'Invalid payment identifier.');
  return z.object({ id: z.string(), status: z.string() }).parse(
    await provider(`payments/${paymentId}/refund`, 'POST', {
      notes: { receipt },
    }),
  );
}
