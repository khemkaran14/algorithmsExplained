import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';

export async function GettingStarted() {
  const t = await getTranslations('gettingStarted');
  return (
    <section
      aria-labelledby="getting-started-title"
      className="mx-auto mb-12 max-w-7xl px-5"
    >
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10">
        <h2 id="getting-started-title" className="text-2xl font-semibold">
          {t('title')}
        </h2>
        <p className="my-4 max-w-3xl text-[var(--muted)]">{t('description')}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/learn/dsa/sorting/bubble-sort">{t('start')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/learn/dsa">{t('browse')}</Link>
          </Button>
        </div>
        <h3 className="mb-3 mt-7 font-semibold">{t('next')}</h3>
        <ol className="space-y-3 text-sm">
          <li>{t('step1')}</li>
          <li>{t('step2')}</li>
          <li>{t('step3')}</li>
        </ol>
        <div className="my-5 flex flex-wrap gap-5 text-sm underline">
          <Link href="/learn/dsa/linear/arrays-dynamic-arrays">
            {t('arrays')}
          </Link>
          <Link href="/learn/dsa/foundations/big-o">{t('complexity')}</Link>
        </div>
        <p className="text-sm text-[var(--muted)]">{t('account')}</p>
      </div>
    </section>
  );
}
