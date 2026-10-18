import { db } from '@/lib/db';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';

export async function AuthNav() {
  const session = await auth();
  const t = await getTranslations('auth');
  const admin =
    session?.user?.id &&
    (
      await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      })
    )?.role === 'admin';
  return session?.user?.id ? (
    <>
      <Link href="/account">{t('account')}</Link>
      {admin && <Link href="/admin">{t('admin')}</Link>}
    </>
  ) : (
    <Link href="/sign-in">{t('signIn')}</Link>
  );
}
