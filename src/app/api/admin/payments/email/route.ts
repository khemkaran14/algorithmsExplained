import { z } from 'zod';
import { requireAdmin } from '@/lib/user';
import { api, json, readJson, requireSameOrigin, ApiError } from '@/lib/http';
import { db } from '@/lib/db';
import { fetchProviderPayment } from '@/payments/provider';

export async function POST(request: Request) {
  return api(async () => {
    requireSameOrigin(request);
    await requireAdmin();
    const { paymentId } = z
      .object({ paymentId: z.string().min(1).max(128) })
      .strict()
      .parse(await readJson(request, 4096));
    const saved = await db.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        userId: true,
        paymentEmail: true,
        razorpayPaymentId: true,
        razorpayOrderId: true,
        amount: true,
        currency: true,
        status: true,
      },
    });
    if (
      !saved?.userId ||
      !saved.razorpayPaymentId ||
      !['paid', 'refund-pending', 'refunded'].includes(saved.status)
    )
      throw new ApiError(404, 'Captured purchase not found.');
    if (saved.paymentEmail) return json({ recorded: true });
    const payment = await fetchProviderPayment(saved.razorpayPaymentId);
    if (
      payment.id !== saved.razorpayPaymentId ||
      payment.order_id !== saved.razorpayOrderId ||
      payment.amount !== saved.amount ||
      payment.currency !== saved.currency ||
      !['captured', 'refunded'].includes(payment.status)
    )
      throw new ApiError(502, 'Provider payment does not match this purchase.');
    if (!payment.email) return json({ recorded: false });
    const result = await db.payment.updateMany({
      where: {
        id: saved.id,
        userId: saved.userId,
        paymentEmail: null,
        razorpayPaymentId: payment.id,
      },
      data: { paymentEmail: payment.email },
    });
    return json({ recorded: result.count === 1 });
  });
}
