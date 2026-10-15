import { auth } from '@/auth';
import { LearningDashboard } from '@/components/learning-dashboard';
export const metadata = { title: 'Your learning dashboard' };
export default async function Learn() {
  const session = await auth();
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <p className="mb-3 font-mono text-xs text-[var(--muted)]">
        A LITTLE PROGRESS, EVERY DAY
      </p>
      <h1 className="mb-8 text-4xl font-semibold tracking-tight">
        Your learning space
      </h1>
      <LearningDashboard signedIn={Boolean(session?.user)} />
    </section>
  );
}
