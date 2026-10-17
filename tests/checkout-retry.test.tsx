import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { CheckoutButton } from '@/components/checkout-button';

afterEach(() => {
  delete window.Razorpay;
  vi.unstubAllGlobals();
});

it('starts a new idempotent attempt after a definitive failed payment', async () => {
  let fail: (() => void) | undefined;
  window.Razorpay = class {
    open() {}
    on(event: string, callback: () => void) {
      if (event === 'payment.failed') fail = callback;
    }
  };
  const request = vi.fn(async () =>
    Response.json({
      key: 'rzp_test_fixtureOnly',
      orderId: 'order_fixture',
      amount: 19900,
      currency: 'INR',
      name: 'Test',
      email: 'test@example.invalid',
    }),
  );
  vi.stubGlobal('fetch', request);
  render(<CheckoutButton signedIn allAccess={false} product="Test" />);
  fireEvent.click(screen.getByRole('button', { name: 'Unlock everything' }));
  await waitFor(() => expect(fail).toBeTypeOf('function'));
  act(() => fail!());
  fireEvent.click(screen.getByRole('button', { name: 'Unlock everything' }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  const calls = request.mock.calls as unknown as [string, RequestInit][];
  const first = JSON.parse(calls[0][1].body as string);
  const second = JSON.parse(calls[1][1].body as string);
  expect(first.idempotencyKey).not.toBe(second.idempotencyKey);
});
