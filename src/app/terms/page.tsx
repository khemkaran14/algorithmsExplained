import { PRICING } from '@/config/pricing';
export const metadata = { title: 'Terms of service' };
export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-semibold">Terms of service</h1>
      <p className="my-6 rounded-xl border border-amber-600 p-4 text-sm">
        Template — review with a lawyer and complete the business details before
        launch.
      </p>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Access and accounts</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          You must provide accurate account details and keep your sign-in links
          private. Access is personal and may not be resold. Users under the
          applicable age of consent need a parent or guardian’s permission.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Purchase and delivery</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          All Access is a one-time INR {PRICING.amountPaise / 100} purchase for
          lifetime access to current and future lessons, subject to continued
          operation of the service. Access is delivered digitally after payment
          capture is verified. No physical goods are shipped.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Educational use</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          Lessons are for education and do not guarantee employment,
          certification by a cloud provider, or suitability for a production
          system. Do not use interactive security examples against systems
          without authorization.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Availability and changes</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          We may improve, correct or retire content. We will communicate
          material changes and provide support for purchase/access problems.
          Liability and dispute terms must be reviewed for the operating
          business and jurisdiction.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Disputes and contact</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          Contact the operator through the Contact page first. Applicable
          consumer protections remain in force. The governing jurisdiction and
          business identity must be completed before launch.
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
