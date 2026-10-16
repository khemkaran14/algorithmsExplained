import { Suspense } from 'react';
import type { LessonMeta } from '@/content/catalog';
export const dynamic = 'force-dynamic';
import { canReadLesson } from '@/payments/access';
import { serverLessonData } from '@/content/server-registry';
import { freeVisualizers } from '@/engine/registry';
import { LockedLesson } from '@/components/lesson/locked-lesson';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { catalog, lessonUrl } from '@/content/catalog';
import { loadLesson } from '@/content/load';
import { Quiz, LessonNotebook } from '@/components/lesson/quiz';
import { LessonPlayer } from '@/components/lesson/lesson-player';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string; module: string; lesson: string }>;
}) {
  const p = await params,
    l = catalog.find(
      (l) =>
        l.track === p.track && l.module === p.module && l.slug === p.lesson,
    );
  return { title: l?.title ?? 'Lesson not found', description: l?.description };
}
export default async function LessonPage({
  params,
}: {
  params: Promise<{ track: string; module: string; lesson: string }>;
}) {
  const p = await params;
  const meta = catalog.find(
    (l) => l.track === p.track && l.module === p.module && l.slug === p.lesson,
  );
  if (!meta) notFound();
  if (meta.status === 'planned')
    return (
      <section className="mx-auto max-w-3xl px-5 py-16">
        <p className="font-mono text-xs">IN THE CURRICULUM</p>
        <h1 className="my-5 text-4xl font-semibold">{meta.title}</h1>
        <p className="mb-6 text-[var(--muted)]">
          This lesson is being authored. Its interactive content is not
          available yet.
        </p>
        <Link href="/learn" className="underline">
          Explore available lessons
        </Link>
      </section>
    );
  if (!(await canReadLesson(meta))) return <LockedLesson meta={meta} />;
  const next = catalog[(catalog.indexOf(meta) + 1) % catalog.length];
  return (
    <article className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap gap-2 text-xs text-[var(--muted)]"
      >
        <Link href="/learn">Learn</Link>
        <span>/</span>
        <Link href={`/learn/${meta.track}`}>{meta.track.toUpperCase()}</Link>
        <span>/</span>
        <Link href={`/learn/${meta.track}/${meta.module}`}>{meta.module}</Link>
      </nav>
      <div className="mb-8">
        <p className="mb-3 font-mono text-xs text-[var(--muted)]">
          {meta.level.toUpperCase()} · {meta.estimatedMinutes} MIN ·{' '}
          {meta.isFree ? 'FREE LESSON' : 'ALL ACCESS'}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {meta.title}
        </h1>
        <p className="mt-3 text-lg text-[var(--muted)]">{meta.description}</p>
      </div>
      <Suspense
        fallback={
          <div className="min-h-[52rem] rounded-2xl border border-[var(--border)] p-6">
            <p role="status">Loading interactive lesson…</p>
          </div>
        }
      >
        <LessonBody meta={meta} />
      </Suspense>
      <Link
        className="inline-block rounded-xl border border-[var(--border)] p-4"
        href={lessonUrl(next)}
      >
        Next: {next.title} →
      </Link>
    </article>
  );
}

async function LessonBody({ meta }: { meta: LessonMeta }) {
  const [{ Content, code, quiz }, playerData] = await Promise.all([
    loadLesson(meta),
    serverLessonData(meta),
  ]);
  const localPlayer = meta.isFree && Object.hasOwn(freeVisualizers, meta.slug);
  return (
    <>
      <LessonPlayer
        key={meta.slug}
        id={meta.slug}
        code={code}
        remote={localPlayer ? undefined : playerData}
        measurements={localPlayer ? playerData.measurements : undefined}
      />
      <div className="lesson-prose my-12 max-w-3xl">
        <Content />
      </div>
      <Quiz key={`quiz-${meta.slug}`} slug={meta.slug} questions={quiz} />
      <LessonNotebook key={`notes-${meta.slug}`} slug={meta.slug} />
    </>
  );
}
