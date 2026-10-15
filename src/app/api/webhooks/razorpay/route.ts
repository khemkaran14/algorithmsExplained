import { z } from 'zod';
import { api, json, ApiError } from '@/lib/http';
import { validSignature } from '@/payments/security';
import { processPaymentEvent } from '@/payments/service';
import { fetchProviderPayment } from '@/payments/provider';
import { dispatchReceipts } from '@/payments/receipts';
const entity = z.object({
  id: z.string(),
  order_id: z.string(),
  amount: z.number().int(),
  currency: z.string(),
  status: z.string(),
});
const schema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({ entity }).optional(),
    refund: z
      .object({
        entity: z.object({
          id: z.string(),
          payment_id: z.string(),
          status: z.string(),
        }),
      })
      .optional(),
  }),
});
export async function POST(request: Request) {
  return api(async () => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret)
      throw new ApiError(503, 'Webhook verification is not configured.');
    const raw = await request.text();
    if (raw.length > 262144)
      throw new ApiError(413, 'Webhook payload is too large.');
    if (
      !validSignature(
        raw,
        request.headers.get('x-razorpay-signature') ?? '',
        secret,
      )
    )
      throw new ApiError(400, 'Webhook signature is invalid.');
    const eventId = z
      .string()
      .min(1)
      .max(200)
      .parse(request.headers.get('x-razorpay-event-id'));
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new ApiError(400, 'Invalid webhook JSON.');
    }
    const data = schema.parse(parsed);
    if (
      !['payment.captured', 'payment.failed', 'refund.processed'].includes(
        data.event,
      )
    )
      return json({ ignored: true });
    let payment = data.payload.payment?.entity;
    if (data.event === 'refund.processed') {
      const refund = data.payload.refund?.entity;
      if (!refund || refund.status !== 'processed')
        throw new ApiError(400, 'Refund is not processed.');
      payment = await fetchProviderPayment(refund.payment_id);
    }
    if (!payment) throw new ApiError(400, 'Payment payload is missing.');
    const result = await processPaymentEvent(
      eventId,
      data.event,
      payment,
      data.event === 'payment.captured'
        ? 'captured'
        : data.event === 'payment.failed'
          ? 'failed'
          : 'refunded',
    );
    await dispatchReceipts();
    return json({ received: true, duplicate: result.duplicate });
  });
}
