import { getTranslations } from 'next-intl/server';
export default async function Loading() {
  const t = await getTranslations('common');
  return (
    <p role="status" className="min-h-[60vh] p-10">
      {t('loading')}
    </p>
  );
}
