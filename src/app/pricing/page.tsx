import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { auth } from '@/auth';
import { hasAllAccess } from '@/payments/access';
import { PRICING } from '@/config/pricing';
import { PRODUCT } from '@/config/product';
import { CheckoutButton } from '@/components/checkout-button';
export const metadata = { title: 'Lifetime access' };
export default async function Pricing() {
  const t = await getTranslations('payments');
  const testMode = process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_');
  const session = await auth();
  const access = session?.user?.id
    ? await hasAllAccess(session.user.id)
    : false;
  const price = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: PRICING.currency,
    maximumFractionDigits: 0,
  }).format(PRICING.amountPaise / 100);
  return (
    <section className="mx-auto max-w-4xl px-5 py-16">
      <p className="mb-4 text-center font-mono text-xs text-[var(--muted)]">
        ONE PURCHASE. A LIFETIME OF AHA.
      </p>
      <h1 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
        Invest in your understanding.
      </h1>
      <div className="mx-auto my-10 max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7">
        <h2 className="text-2xl font-semibold">{PRODUCT.name} All Access</h2>
        <p className="my-5 text-5xl font-semibold">
          {price}
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">
            one time
          </span>
        </p>
        <ul className="mb-7 space-y-3 text-sm">
          {[
            'All current and future lessons',
            'Watch, Try and Quiz modes',
            'Four languages of synchronized code',
            'DSA, system design, databases and cloud',
            'Track completion certificates',
            'No ads. No recurring subscription.',
          ].map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
        {testMode && (
          <p
            role="status"
            className="mb-5 rounded-xl border border-[var(--border)] p-3 text-sm"
          >
            {t('testMode')}
          </p>
        )}
        <CheckoutButton
          signedIn={Boolean(session?.user)}
          allAccess={access}
          product={PRODUCT.name}
        />
        <p className="mt-5 text-xs leading-relaxed text-[var(--muted)]">
          Secure checkout by Razorpay. UPI, cards, netbanking and wallets.
          Access begins after server-side capture confirmation.
        </p>
      </div>
      <p className="text-center text-sm text-[var(--muted)]">
        Free lessons stay free. Try them before purchasing.{' '}
        <Link href="/learn" className="underline">
          Explore lessons
        </Link>
      </p>
      <p className="mt-6 text-center text-xs">
        <Link href="/terms" className="underline">
          Terms
        </Link>{' '}
        ·{' '}
        <Link href="/privacy" className="underline">
          Privacy
        </Link>{' '}
        ·{' '}
        <Link href="/refunds" className="underline">
          Refund & cancellation
        </Link>
      </p>
    </section>
  );
}
