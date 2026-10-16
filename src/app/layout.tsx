import { headers } from 'next/headers';
import { LessonSearch } from '@/components/lesson-search';
import type { Metadata } from 'next';
import Link from 'next/link';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { PRODUCT } from '@/config/product';
import { Providers } from '@/components/providers';
import { ThemeToggle } from '@/components/theme-toggle';
import './globals.css';
export const metadata: Metadata = {
  title: { default: PRODUCT.name, template: `%s · ${PRODUCT.name}` },
  description:
    'Visual learning for algorithms, system design, databases, and cloud.',
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations();
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <Providers nonce={nonce}>
            <a className="skip-link" href="#main">
              {t('common.skip')}
            </a>
            <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold tracking-tight"
              >
                <span
                  aria-hidden="true"
                  className="grid size-9 place-items-center rounded-lg bg-lime-300 font-mono text-zinc-950"
                >
                  a↗
                </span>
                {PRODUCT.name}
                <span className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[9px] tracking-widest">
                  LAB
                </span>
              </Link>
              <nav
                aria-label="Main navigation"
                className="flex flex-wrap items-center gap-3 text-sm"
              >
                <Link href="/#tracks" className="hidden sm:block">
                  {t('nav.explore')}
                </Link>
                <Link href="/playground" className="hidden md:block">
                  Playground
                </Link>
                <Link href="/compare" className="hidden md:block">
                  Compare
                </Link>
                <Link href="/cheatsheet" className="hidden lg:block">
                  Cheat sheet
                </Link>
                <LessonSearch />
                <Link href="/sign-in">{t('nav.signIn')}</Link>
                <ThemeToggle />
              </nav>
            </header>
            <main id="main">{children}</main>
            <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-[var(--border)] px-5 py-8 text-sm text-[var(--muted)]">
              <span>
                {PRODUCT.name} © {new Date().getFullYear()}
              </span>
              <span>{t('footer.note')}</span>
            </footer>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
