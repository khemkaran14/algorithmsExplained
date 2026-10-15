import { z } from 'zod';
import { api, json, readJson, requireSameOrigin, ApiError } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { db } from '@/lib/db';
import { validSignature } from '@/payments/security';
import { paymentKeys, fetchProviderPayment } from '@/payments/provider';
import { capturePayment } from '@/payments/service';
const schema = z.object({
  orderId: z.string().regex(/^order_[a-zA-Z0-9]+$/),
  paymentId: z.string().regex(/^pay_[a-zA-Z0-9]+$/),
  signature: z.string().regex(/^[a-fA-F0-9]{64}$/),
});
export async function POST(request: Request) {
  return api(async () => {
    requireSameOrigin(request);
    const user = await requireUser();
    const input = schema.parse(await readJson(request));
    const saved = await db.payment.findUnique({
      where: { razorpayOrderId: input.orderId },
    });
    if (!saved || saved.userId !== user.id)
      throw new ApiError(404, 'Order not found.');
    if (
      !validSignature(
        `${input.orderId}|${input.paymentId}`,
        input.signature,
        paymentKeys().secret,
      )
    )
      throw new ApiError(400, 'Payment signature is invalid.');
    const payment = await fetchProviderPayment(input.paymentId);
    if (payment.order_id !== input.orderId)
      throw new ApiError(400, 'Payment does not belong to this order.');
    if (payment.status !== 'captured') return json({ status: 'pending' }, 202);
    await capturePayment(payment);
    return json({ status: 'paid' });
  });
}
