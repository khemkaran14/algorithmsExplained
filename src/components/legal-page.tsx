import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
export async function LegalPage({ page }: { page: string }) {
  const t = await getTranslations('legal');
  const sections = t.raw(`${page}.sections`) as [string, string][];
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-semibold">{t(`${page}.title`)}</h1>
      <p className="my-5 text-sm text-[var(--muted)]">{t('updated')}</p>
      {sections.map(([heading, text]) => (
        <section key={heading} className="my-8">
          <h2 className="mb-3 text-xl font-semibold">{heading}</h2>
          <p className="leading-relaxed text-[var(--muted)]">{text}</p>
        </section>
      ))}
      <dl className="my-8 space-y-3 rounded-xl border border-[var(--border)] p-5">
        <div>
          <dt>{t('operator')}</dt>
          <dd>{process.env.BUSINESS_NAME || 'AlgoVerse'}</dd>
        </div>
        <div>
          <dt>{t('support')}</dt>
          <dd>
            {process.env.BUSINESS_EMAIL ? (
              <a
                className="underline"
                href={`mailto:${process.env.BUSINESS_EMAIL}`}
              >
                {process.env.BUSINESS_EMAIL}
              </a>
            ) : (
              t('missingSupport')
            )}
          </dd>
        </div>
        {process.env.BUSINESS_ADDRESS && (
          <div>
            <dt>{t('address')}</dt>
            <dd className="whitespace-pre-line">
              {process.env.BUSINESS_ADDRESS}
            </dd>
          </div>
        )}
        {process.env.BUSINESS_JURISDICTION && (
          <div>
            <dt>{t('jurisdiction')}</dt>
            <dd>{process.env.BUSINESS_JURISDICTION}</dd>
          </div>
        )}
      </dl>
      <nav className="flex flex-wrap gap-4" aria-label={t('footer')}>
        {['privacy', 'terms', 'refunds', 'shipping', 'cookies', 'contact']
          .filter((p) => p !== page)
          .map((p) => (
            <Link key={p} href={`/${p}`} className="underline">
              {t(`${p}.title`)}
            </Link>
          ))}
      </nav>
    </article>
  );
}
