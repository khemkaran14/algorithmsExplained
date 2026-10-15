export const metadata = { title: 'Refund & cancellation policy' };
export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-semibold">Refund & cancellation policy</h1>
      <p className="my-6 rounded-xl border border-amber-600 p-4 text-sm">
        Template — review with a lawyer and complete the business details before
        launch.
      </p>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Digital access</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          Access is delivered digitally after a successful captured payment.
          There is no recurring subscription to cancel.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Refund requests</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          This template proposes a seven-day request window for duplicate
          charges, accidental purchases and unresolved access failures. The
          operator must review and adopt an explicit policy before accepting
          live payments.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Processing</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          Contact support with the registered email and Razorpay payment ID.
          Never send card numbers, passwords or OTPs. Approved refunds return
          through the original payment method; provider/bank processing times
          vary.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">After a refund</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          A processed refund revokes the entitlement linked to that payment and
          its completion certificates unless another valid entitlement exists.
          Statutory consumer rights remain unaffected.
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
