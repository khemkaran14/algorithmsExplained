import { z } from 'zod';
import { api, json, readJson, requireSameOrigin, ApiError } from '@/lib/http';
import { requireAdmin } from '@/lib/user';
import { db } from '@/lib/db';
import { refundProviderPayment } from '@/payments/provider';
const schema = z.object({ paymentId: z.string().min(1).max(100) });
export async function POST(request: Request) {
  return api(async () => {
    requireSameOrigin(request);
    await requireAdmin();
    const input = schema.parse(await readJson(request));
    const p = await db.payment.findUnique({ where: { id: input.paymentId } });
    if (!p || p.status !== 'paid' || !p.razorpayPaymentId)
      throw new ApiError(
        409,
        'Only captured, unrefunded payments can be refunded.',
      );
    const changed = await db.payment.updateMany({
      where: { id: p.id, status: 'paid' },
      data: { status: 'refund-pending' },
    });
    if (!changed.count)
      throw new ApiError(409, 'This payment is already being processed.');
    try {
      const refund = await refundProviderPayment(
        p.razorpayPaymentId,
        p.receipt,
      );
      return json({ status: 'refund-pending', refundId: refund.id });
    } catch {
      throw new ApiError(
        502,
        'Refund confirmation is pending. Check the Razorpay dashboard before retrying.',
      );
    }
  });
}
