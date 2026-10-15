export const metadata = { title: 'About' };
export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-semibold">About</h1>
      <p className="my-6 rounded-xl border border-amber-600 p-4 text-sm">
        Template — review with a lawyer and complete the business details before
        launch.
      </p>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Our purpose</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          We make difficult computer science ideas easier to understand through
          step-by-step visuals, practice and short quizzes.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Our scope</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          The curriculum covers data structures and algorithms, system design,
          database principles, and AWS/GCP cloud concepts.
        </p>
      </section>
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold">Business identity</h2>
        <p className="leading-relaxed text-[var(--muted)]">
          The operating business name, address, grievance contact, and relevant
          registration details must be completed before a public launch.
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
