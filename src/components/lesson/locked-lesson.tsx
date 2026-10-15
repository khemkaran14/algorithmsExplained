import Link from 'next/link';
import { Lock } from 'lucide-react';
import type { LessonMeta } from '@/content/catalog';
import { PRICING } from '@/config/pricing';
import { Button } from '../ui/button';
export function LockedLesson({ meta }: { meta: LessonMeta }) {
  const price = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: PRICING.currency,
    maximumFractionDigits: 0,
  }).format(PRICING.amountPaise / 100);
  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <p className="mb-4 font-mono text-xs text-[var(--muted)]">
        {meta.track.toUpperCase()} / {meta.module.toUpperCase()}
      </p>
      <h1 className="text-4xl font-semibold">{meta.title}</h1>
      <p className="my-5 text-lg text-[var(--muted)]">{meta.description}</p>
      <div
        className="grid-paper relative mb-8 flex h-64 items-end justify-center gap-4 overflow-hidden rounded-2xl border border-[var(--border)] p-8"
        aria-label="Silent illustrative preview"
      >
        {[3, 6, 2, 8, 5].map((n, i) => (
          <div
            key={i}
            className="paid-preview w-8 rounded-t-lg bg-lime-300"
            style={{ height: n * 18, animationDelay: `${i * 0.2}s` }}
          />
        ))}
        <span className="absolute left-4 top-4 rounded-full bg-[var(--background)] px-3 py-1 text-xs">
          5-second silent preview
        </span>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <Lock className="mb-4" size={24} />
        <h2 className="text-2xl font-semibold">One unlock. Every lesson.</h2>
        <p className="my-4 text-sm text-[var(--muted)]">
          Watch, try, explore the code and test yourself. Includes all current
          and future lessons, with no ads.
        </p>
        <ul className="mb-6 flex flex-wrap gap-2 text-xs">
          {meta.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-[var(--border)] px-3 py-1"
            >
              {tag}
            </li>
          ))}
        </ul>
        <Button asChild>
          <Link href="/pricing">Unlock everything for {price}</Link>
        </Button>
      </div>
      <Link href="/learn" className="mt-6 inline-block text-sm underline">
        Explore free lessons
      </Link>
    </article>
  );
}
