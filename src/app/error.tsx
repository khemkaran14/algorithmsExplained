'use client';
import { useTranslations } from 'next-intl';
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');
  return (
    <section className="mx-auto min-h-[60vh] max-w-xl px-5 py-20">
      <h1 className="text-3xl">{t('error')}</h1>
      <button className="mt-6 rounded-xl border p-3" onClick={reset}>
        {t('retry')}
      </button>
    </section>
  );
}
