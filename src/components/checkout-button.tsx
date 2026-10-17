'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
type CheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
type Options = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  handler: (response: CheckoutResponse) => void;
  modal: { ondismiss: () => void };
};
declare global {
  interface Window {
    Razorpay?: new (options: Options) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}
let checkoutScript: Promise<void> | undefined;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!checkoutScript)
    checkoutScript = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        checkoutScript = undefined;
        script.remove();
        reject(
          new Error(
            'Checkout could not load. Check your connection and try again.',
          ),
        );
      };
      document.head.appendChild(script);
    });
  return checkoutScript;
}
export function CheckoutButton({
  signedIn,
  allAccess,
  product,
}: {
  signedIn: boolean;
  allAccess: boolean;
  product: string;
}) {
  const [coupon, setCoupon] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const key = useRef<string>('');
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  async function pay() {
    setBusy(true);
    setError('');
    try {
      key.current ||= crypto.randomUUID();
      const result = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon, idempotencyKey: key.current }),
      });
      const data = (await result.json()) as {
        error?: string;
        key: string;
        orderId: string;
        amount: number;
        currency: string;
        name: string;
        email: string;
      };
      if (!result.ok)
        throw new Error(data.error ?? 'Checkout could not be started.');
      await loadCheckout();
      if (!window.Razorpay) throw new Error('Checkout is unavailable.');
      const checkout = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: product,
        description: 'Lifetime access to all current and future lessons',
        order_id: data.orderId,
        prefill: { name: data.name, email: data.email },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (response) => {
          try {
            const verify = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            const body = (await verify.json()) as { error?: string };
            if (!verify.ok)
              throw new Error(
                body.error ??
                  'Payment verification is pending. Check your account before retrying payment.',
              );
            window.location.assign('/checkout/success');
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Verification failed.');
            setBusy(false);
          }
        },
      });
      checkout.on('payment.failed', () => {
        key.current = '';
        setError('Payment was not completed. You can retry safely.');
        setBusy(false);
      });
      checkout.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed.');
      setBusy(false);
    }
  }
  if (allAccess)
    return (
      <Button asChild>
        <Link href="/learn">Your lifetime access is active →</Link>
      </Button>
    );
  if (!signedIn)
    return (
      <Button asChild>
        <Link href="/sign-in">Sign in to unlock everything</Link>
      </Button>
    );
  return (
    <div className="space-y-4">
      <label htmlFor="coupon" className="block text-sm">
        Have a coupon?
      </label>
      <input
        id="coupon"
        disabled={!ready || busy}
        value={coupon}
        maxLength={32}
        onChange={(e) => {
          setCoupon(e.target.value.toUpperCase());
          key.current = '';
        }}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 font-mono"
        autoComplete="off"
      />
      <Button
        className="w-full"
        disabled={!ready || busy}
        onClick={() => void pay()}
      >
        {busy ? 'Opening secure checkout…' : 'Unlock everything'}
      </Button>
      <p role="status" className="text-sm text-red-600 dark:text-red-300">
        {error}
      </p>
    </div>
  );
}
