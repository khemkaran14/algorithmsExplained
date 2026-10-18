// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { expect, it, vi } from 'vitest';
vi.mock('@/lib/user', () => ({
  requireAdmin: vi.fn(async () => ({ id: 'fixture-admin' })),
}));
vi.mock('@/payments/provider', () => ({ fetchProviderPayment: vi.fn() }));
import { db } from '@/lib/db';
import { fetchProviderPayment } from '@/payments/provider';
import { POST } from '@/app/api/admin/payments/email/route';

it.skipIf(!process.env.DATABASE_URL)(
  'imports only matching provider email and never restores deleted-account metadata',
  async () => {
    const userId = randomUUID(),
      paymentId = randomUUID();
    const provider = {
      id: `pay_${paymentId.replaceAll('-', '')}`,
      order_id: `order_${paymentId.replaceAll('-', '')}`,
      amount: 19900,
      currency: 'INR',
      status: 'captured',
      email: `billing-${userId}@example.com`,
    };
    const request = () =>
      new Request('http://127.0.0.1:3000/api/admin/payments/email', {
        method: 'POST',
        headers: {
          Origin: 'http://127.0.0.1:3000',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      });
    vi.stubEnv('AUTH_URL', 'http://127.0.0.1:3000');
    try {
      await db.user.create({
        data: { id: userId, email: `login-${userId}@example.com` },
      });
      await db.payment.create({
        data: {
          id: paymentId,
          userId,
          receipt: paymentId,
          amount: 19900,
          currency: 'INR',
          status: 'paid',
          razorpayPaymentId: provider.id,
          razorpayOrderId: provider.order_id,
        },
      });
      vi.mocked(fetchProviderPayment).mockResolvedValue({
        ...provider,
        order_id: 'order_wrong',
      });
      expect((await POST(request())).status).toBe(502);
      expect(
        (await db.payment.findUnique({ where: { id: paymentId } }))
          ?.paymentEmail,
      ).toBeNull();
      vi.mocked(fetchProviderPayment).mockResolvedValue(provider);
      expect(await (await POST(request())).json()).toEqual({ recorded: true });
      expect(
        (await db.payment.findUnique({ where: { id: paymentId } }))
          ?.paymentEmail,
      ).toBe(provider.email);
      await POST(request());
      expect(fetchProviderPayment).toHaveBeenCalledTimes(2);
      await db.payment.update({
        where: { id: paymentId },
        data: { userId: null, paymentEmail: null },
      });
      expect((await POST(request())).status).toBe(404);
      expect(fetchProviderPayment).toHaveBeenCalledTimes(2);
    } finally {
      vi.unstubAllEnvs();
      await db.payment.deleteMany({ where: { id: paymentId } });
      await db.user.deleteMany({ where: { id: userId } });
    }
  },
);
