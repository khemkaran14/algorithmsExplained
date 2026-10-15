import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
export default async function NotFound() {
  const t = await getTranslations('common');
  return (
    <section className="mx-auto min-h-[60vh] max-w-xl px-5 py-20">
      <p className="font-mono">{t('uncharted')}</p>
      <h1 className="my-5 text-4xl font-semibold">{t('notFound')}</h1>
      <Link href="/" className="underline">
        {t('home')}
      </Link>
    </section>
  );
}
