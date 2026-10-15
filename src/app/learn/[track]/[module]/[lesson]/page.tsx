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
  if (!meta.isFree)
    return (
      <section className="mx-auto max-w-3xl px-5 py-20">
        <h1>{meta.title}</h1>
        <p>This lesson requires all-access.</p>
        <Link href="/pricing">Unlock all lessons</Link>
      </section>
    );
  const { Content, code, quiz } = await loadLesson(meta);
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
          {meta.level.toUpperCase()} · {meta.estimatedMinutes} MIN · FREE LESSON
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {meta.title}
        </h1>
        <p className="mt-3 text-lg text-[var(--muted)]">{meta.description}</p>
      </div>
      <LessonPlayer id={meta.slug} code={code} />
      <div className="lesson-prose my-12 max-w-3xl">
        <Content />
      </div>
      <Quiz slug={meta.slug} questions={quiz} />
      <LessonNotebook slug={meta.slug} />
      <Link
        className="inline-block rounded-xl border border-[var(--border)] p-4"
        href={lessonUrl(next)}
      >
        Next: {next.title} →
      </Link>
    </article>
  );
}
