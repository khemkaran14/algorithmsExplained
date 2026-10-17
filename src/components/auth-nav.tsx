import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';

export async function AuthNav() {
  const session = await auth();
  const t = await getTranslations('auth');
  return session?.user?.id ? (
    <Link href="/account">{t('account')}</Link>
  ) : (
    <Link href="/sign-in">{t('signIn')}</Link>
  );
}
