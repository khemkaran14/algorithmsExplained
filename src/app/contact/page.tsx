export const metadata = { title: 'Contact us' };
export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-semibold">Contact us</h1>
      <p className="my-6 rounded-xl border border-amber-600 p-4 text-sm">
        Template — review with a lawyer and complete the business details before
        launch.
      </p>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Support</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          For account, access, payment or privacy help, use the business support
          email below. Include a payment reference only when relevant; never
          share OTPs or secret keys.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Response times</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          The operator must publish support hours and expected response times
          before launch.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">
          Business and grievance contact
        </h2>
        <p className="leading-relaxed text-[var(--muted)]">
          Business name, address and grievance contact must be configured and
          reviewed before live payments are enabled.
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
