import Link from 'next/link';
import { PRICING } from '@/config/pricing';
import { getTranslations } from 'next-intl/server';
import {
  ArrowUpRight,
  Braces,
  Network,
  Database,
  Cloud,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
export default async function Home() {
  const t = await getTranslations();
  const tracks = [
    { id: 'dsa', icon: Braces, color: 'bg-lime-300' },
    { id: 'system', icon: Network, color: 'bg-violet-300' },
    { id: 'database', icon: Database, color: 'bg-orange-200' },
    { id: 'cloud', icon: Cloud, color: 'bg-sky-200' },
  ] as const;
  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-14 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <p className="mb-7 font-mono text-xs tracking-widest text-[var(--muted)]">
            {t('home.eyebrow')}
          </p>
          <h1 className="whitespace-pre-line text-6xl font-semibold leading-[1.03] tracking-[-0.06em] sm:text-8xl">
            {t('home.title')}
          </h1>
          <p className="my-7 max-w-lg text-lg leading-relaxed text-[var(--muted)]">
            {t('home.description')}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="#tracks">
                {t('home.cta')}
                <ArrowUpRight size={18} />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#roadmap">{t('home.secondary')}</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 font-mono text-xs text-[var(--muted)]">
            <span>01 / SEE IT</span>
            <span>02 / TRY IT</span>
            <span>03 / GET IT</span>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <span className="font-mono text-xs">SORTING / 001</span>
            <span className="rounded-full bg-lime-300 px-3 py-1 text-xs font-bold text-zinc-950">
              {t('home.preview')}
            </span>
          </div>
          <div className="grid-paper p-6 sm:p-10">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-2xl font-semibold">{t('home.bubble')}</h2>
              <span className="font-mono text-xs text-[var(--muted)]">
                O(n²)
              </span>
            </div>
            <div
              aria-label="Illustration of array values 3, 7, 4, 9, 2, 6"
              role="img"
              className="flex h-52 items-end justify-center gap-2 sm:gap-4"
            >
              {[3, 7, 4, 9, 2, 6].map((n, i) => (
                <div
                  key={i}
                  className={`preview-bar flex w-10 items-end justify-center rounded-t-lg pb-3 font-mono text-sm font-bold text-zinc-950 sm:w-12 ${i === 1 || i === 2 ? 'bg-violet-300' : 'bg-lime-300'}`}
                  style={{
                    height: `${n * 10 + 20}%`,
                    maxHeight: '100%',
                    animationDelay: `${i * 0.2}s`,
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-xs text-[var(--muted)]">
              {t('home.previewNote')}
            </div>
          </div>
        </div>
      </section>
      <section id="tracks" className="mx-auto max-w-7xl scroll-mt-8 px-5 pb-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 font-mono text-xs text-[var(--muted)]">
              {t('home.map')}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t('home.tracks')}
            </h2>
          </div>
          <p className="max-w-xs text-sm text-[var(--muted)]">
            {t('home.tracksDescription')}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tracks.map(({ id, icon: Icon, color }, i) => (
            <article
              key={id}
              className="flex flex-col rounded-2xl border border-[var(--border)] p-6"
            >
              <div className="mb-7 flex items-center justify-between">
                <span className={`rounded-xl p-3 text-zinc-950 ${color}`}>
                  <Icon size={24} />
                </span>
                <span className="font-mono text-xs text-[var(--muted)]">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                {t(`tracks.${id}.title`)}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-[var(--muted)]">
                {t(`tracks.${id}.description`)}
              </p>
              <p className="mt-auto border-t border-[var(--border)] pt-4 font-mono text-xs leading-relaxed text-[var(--muted)]">
                {t(`tracks.${id}.topics`)}
              </p>
              <span className="mt-5 text-xs font-semibold">
                {t('common.comingSoon')}
              </span>
            </article>
          ))}
        </div>
      </section>
      <section id="roadmap" className="mx-auto mb-20 max-w-7xl px-5">
        <div className="grid gap-8 rounded-3xl bg-[var(--surface)] p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 font-mono text-xs text-[var(--muted)]">
              {t('home.steps')}
            </p>
            <h2 className="max-w-md text-3xl font-semibold tracking-tight">
              {t('home.foundation')}
            </h2>
          </div>
          <ol className="space-y-5">
            {[
              t('home.foundationStep'),
              t('home.engineStep'),
              t('home.progressStep'),
            ].map((label, i) => (
              <li
                key={label}
                className="flex items-center gap-4 border-b border-[var(--border)] pb-5"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[var(--border)] font-mono text-xs">
                  {i === 0 ? <Check size={16} /> : i + 1}
                </span>
                <span>{label}</span>
                <span className="ml-auto text-xs text-[var(--muted)]">
                  {i === 0 ? t('common.now') : t('common.next')}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-5 pb-20 text-center">
        <h2 className="text-3xl font-semibold">{t('home.pricingTitle')}</h2>
        <p className="my-5 text-[var(--muted)]">
          {t('home.pricingDescription', {
            price: new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: PRICING.currency,
              maximumFractionDigits: 0,
            }).format(PRICING.amountPaise / 100),
          })}
        </p>
        <p className="font-mono text-xs text-[var(--muted)]">
          {t('home.pricingNote')}
        </p>
      </section>
    </>
  );
}
