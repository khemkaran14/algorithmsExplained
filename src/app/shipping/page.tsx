export const metadata = { title: 'Shipping & digital delivery' };
export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-semibold">Shipping & digital delivery</h1>
      <p className="my-6 rounded-xl border border-amber-600 p-4 text-sm">
        Template — review with a lawyer and complete the business details before
        launch.
      </p>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">No physical shipment</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          All products are digital educational access. There are no physical
          packages, shipping charges or delivery addresses.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Delivery timing</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          Lifetime access is enabled after server-side confirmation that
          Razorpay captured the payment. If a confirmation is delayed, check
          your account and contact support before paying again.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Access issues</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          Use the same account used during checkout. The operator can locate the
          purchase from its payment reference and account email.
        </p>
      </section>
      <p className="mt-8 text-sm">
        Support:{' '}
        {process.env.BUSINESS_EMAIL ??
          'Support email must be configured before launch.'}
      </p>
    </article>
  );
}
