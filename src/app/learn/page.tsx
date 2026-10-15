import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
export default async function Learn() {
  const session = await auth();
  if (!session?.user) redirect('/sign-in');
  const t = await getTranslations();
  return (
    <section className="mx-auto min-h-[70vh] max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-semibold">{t('dashboard.title')}</h1>
      <p className="my-6 text-[var(--muted)]">{t('dashboard.description')}</p>
      <Button asChild>
        <Link href="/#tracks">{t('dashboard.browse')}</Link>
      </Button>
      <form
        className="mt-8"
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/' });
        }}
      >
        <Button variant="outline">{t('auth.signOut')}</Button>
      </form>
    </section>
  );
}
