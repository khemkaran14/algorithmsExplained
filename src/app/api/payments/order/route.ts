import { api, json, readJson, requireSameOrigin, ApiError } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { checkoutSchema, createOrder } from '@/payments/service';
import { paymentKeys } from '@/payments/provider';
export async function POST(request: Request) {
  return api(async () => {
    requireSameOrigin(request);
    const user = await requireUser();
    const input = checkoutSchema.parse(await readJson(request));
    const { key } = paymentKeys();
    if (!process.env.RAZORPAY_WEBHOOK_SECRET?.trim())
      throw new ApiError(
        503,
        'Payments are temporarily unavailable. Please try again later.',
      );
    const payment = await createOrder(user.id, input);
    return json({
      orderId: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      key,
      name: user.name ?? '',
      email: user.email ?? '',
    });
  });
}
