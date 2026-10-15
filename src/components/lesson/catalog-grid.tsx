import Link from 'next/link';
import { Lock, ArrowUpRight } from 'lucide-react';
import { lessonUrl, type LessonMeta } from '@/content/catalog';
export function CatalogGrid({ lessons }: { lessons: readonly LessonMeta[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lessons.map((l) => (
        <Link
          key={lessonUrl(l)}
          href={lessonUrl(l)}
          className="group flex flex-col rounded-2xl border border-[var(--border)] p-6 transition hover:bg-[var(--surface)]"
        >
          <div className="mb-6 flex items-center justify-between text-xs">
            <span className="font-mono text-[var(--muted)]">
              {l.module.toUpperCase()}
            </span>
            {l.isFree ? (
              <span className="rounded bg-lime-300 px-2 py-1 text-zinc-950">
                Free
              </span>
            ) : (
              <Lock size={15} aria-label="Paid lesson" />
            )}
          </div>
          <h2 className="text-xl font-semibold">{l.title}</h2>
          <p className="my-3 flex-1 text-sm text-[var(--muted)]">
            {l.description}
          </p>
          <span className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
            {l.estimatedMinutes} min · {l.level}
            <ArrowUpRight size={16} />
          </span>
        </Link>
      ))}
    </div>
  );
}
