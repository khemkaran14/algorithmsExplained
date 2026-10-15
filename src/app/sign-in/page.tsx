export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { signIn, googleEnabled, emailEnabled } from '@/auth';
import { Button } from '@/components/ui/button';
export default async function SignIn() {
  const t = await getTranslations('auth');
  return (
    <section className="mx-auto min-h-[70vh] max-w-md px-5 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="mb-8 mt-4 text-[var(--muted)]">{t('description')}</p>
      {!googleEnabled && !emailEnabled && (
        <p
          role="status"
          className="rounded-xl border border-[var(--border)] p-5 text-sm"
        >
          {t('unavailable')}
        </p>
      )}
      {googleEnabled && (
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/learn' });
          }}
        >
          <Button className="mb-5 w-full">{t('google')}</Button>
        </form>
      )}
      {emailEnabled && (
        <form
          className="space-y-3"
          action={async (formData) => {
            'use server';
            const email = z.email().parse(formData.get('email'));
            await signIn('resend', { email, redirectTo: '/learn' });
          }}
        >
          <label className="block text-sm" htmlFor="email">
            {t('email')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
          />
          <Button className="w-full">{t('send')}</Button>
        </form>
      )}
      <Link className="mt-8 inline-block text-sm underline" href="/">
        {t('back')}
      </Link>
    </section>
  );
}
