export const metadata = { title: 'Privacy policy' };
export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-semibold">Privacy policy</h1>
      <p className="my-6 rounded-xl border border-amber-600 p-4 text-sm">
        Template — review with a lawyer and complete the business details before
        launch.
      </p>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Data we use</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          We use your account name, email and provider identifier for
          authentication; learning progress, notes, bookmarks and quiz results
          for learning features; and payment references for access and
          accounting. Card details are handled by Razorpay and are not stored by
          this app.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">
          Local storage and cookies
        </h2>
        <p className="leading-relaxed text-[var(--muted)]">
          Essential cookies keep you signed in. Guest progress and notes are
          stored on your device, and merge into your account when you sign in.
          Sign-out clears the browser’s account learning data. Optional
          analytics requires consent and can be disabled.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Service providers</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          The operator may use Google, Resend, Razorpay, a database hosting
          provider, Sentry and optional PostHog analytics. Configure appropriate
          contracts and retention policies for the deployment.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Your choices</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          Export your application data or request account deletion through your
          account. Deletion removes learning data and credentials; payment
          references may be retained in anonymized form where accounting law
          requires it.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Retention and contact</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          The operator must publish a specific retention period, grievance
          contact and business address before launch. Contact the operator for
          access, correction or deletion requests.
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
