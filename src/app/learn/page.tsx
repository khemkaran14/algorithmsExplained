import { getTranslations } from 'next-intl/server';
import { GettingStarted } from '@/components/getting-started';
import { auth } from '@/auth';
import { LearningDashboard } from '@/components/learning-dashboard';
export const metadata = { title: 'Your learning dashboard' };
export default async function Learn() {
  const uiText = await getTranslations('ui');

  const session = await auth();
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <p className="mb-3 font-mono text-xs text-[var(--muted)]">
        {uiText('m995c7cef2375')}
      </p>
      <h1 className="mb-8 text-4xl font-semibold tracking-tight">
        {uiText('mc88cdb8e5496')}
      </h1>
      <GettingStarted />
      <LearningDashboard signedIn={Boolean(session?.user)} />
    </section>
  );
}
