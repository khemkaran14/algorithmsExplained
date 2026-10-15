'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
export function PaymentConfirmation() {
  const [state, setState] = useState<'checking' | 'active' | 'pending'>(
    'checking',
  );
  useEffect(() => {
    let cancelled = false,
      attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    async function check() {
      try {
        const response = await fetch('/api/access', { cache: 'no-store' });
        const body = (await response.json()) as { allAccess?: boolean };
        if (cancelled) return;
        if (response.ok && body.allAccess) {
          setState('active');
          return;
        }
      } catch {}
      if (cancelled) return;
      if (++attempts < 10) timer = setTimeout(() => void check(), 2000);
      else setState('pending');
    }
    void check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);
  return (
    <div className="rounded-2xl border border-[var(--border)] p-6">
      <p role="status" className="mb-5">
        {state === 'active'
          ? '✓ Your lifetime access is active. Welcome aboard.'
          : state === 'checking'
            ? 'Confirming your access securely…'
            : 'Your payment is still being confirmed. Do not pay again; check your account or contact support with your Razorpay payment ID.'}
      </p>
      <Link
        href={state === 'active' ? '/learn' : '/account'}
        className="underline"
      >
        {state === 'active' ? 'Start learning' : 'Open your account'} →
      </Link>
    </div>
  );
}
