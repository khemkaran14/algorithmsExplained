// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('@/lib/user', () => ({
  requireUser: vi.fn(async () => ({ id: 'test-user' })),
}));
vi.mock('@/payments/service', async (original) => ({
  ...(await original<typeof import('@/payments/service')>()),
  createOrder: vi.fn(async () => ({
    razorpayOrderId: 'order_fixture',
    amount: 19900,
    currency: 'INR',
  })),
}));
vi.mock('@/payments/provider', () => ({
  paymentKeys: () => ({ key: 'rzp_test_fixture', secret: 'private-secret' }),
  createProviderOrder: vi.fn(),
}));
import { POST } from '@/app/api/payments/order/route';
import { createOrder } from '@/payments/service';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
const request = () =>
  new Request('http://127.0.0.1:3000/api/payments/order', {
    method: 'POST',
    headers: {
      Origin: 'http://127.0.0.1:3000',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idempotencyKey: randomUUID() }),
  });

it('does not create a payable order before webhook verification is configured', async () => {
  vi.stubEnv('AUTH_URL', 'http://127.0.0.1:3000');
  vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', '');
  expect((await POST(request())).status).toBe(503);
  expect(createOrder).not.toHaveBeenCalled();
});

it('allows a configured checkout and exposes only its public key', async () => {
  vi.stubEnv('AUTH_URL', 'http://127.0.0.1:3000');
  vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'test-only-webhook-secret');
  const response = await POST(request());
  expect(response.status).toBe(200);
  const body = await response.text();
  expect(body).toContain('rzp_test_fixture');
  expect(body).not.toContain('private-secret');
  expect(body).not.toContain('test-only-webhook-secret');
});
