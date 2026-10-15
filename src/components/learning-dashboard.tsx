'use client';
import Link from 'next/link';
import { catalog, lessonUrl } from '@/content/catalog';
import {
  useLearning,
  syncLearning,
  readLearning,
  writeLearning,
} from '@/learning/local';
import { learningStats, EMPTY } from '@/learning/progress';
import { useEffect, useState } from 'react';
import { CatalogGrid } from '@/components/lesson/catalog-grid';
export function LearningDashboard({ signedIn }: { signedIn: boolean }) {
  const learning = useLearning(),
    stats = learningStats(learning.progress);
  const [synced, setSynced] = useState(false);
  const [attempted, setAttempted] = useState(false);
  useEffect(() => {
    if (signedIn)
      void syncLearning().then((result) => {
        setSynced(result);
        setAttempted(true);
      });
    else if (readLearning().owner) writeLearning(EMPTY);
  }, [signedIn]);
  const recent = Object.values(learning.progress)
    .filter((p) => p.status !== 'completed')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const resume =
    catalog.find((l) => l.slug === recent?.slug) ??
    catalog.find((l) => l.isFree)!;
  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [stats.xp, 'XP earned'],
          [stats.streak, 'day streak'],
          [stats.completed, 'lessons complete'],
          [stats.minutes, 'minutes learned'],
        ].map(([n, label]) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--border)] p-5"
          >
            <p className="font-mono text-3xl">{n}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">{label}</p>
          </div>
        ))}
      </div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[var(--surface)] p-6">
        <div>
          <p className="mb-2 text-xs text-[var(--muted)]">
            {recent ? 'CONTINUE YOUR JOURNEY' : 'YOUR FIRST AHA AWAITS'}
          </p>
          <h2 className="text-2xl font-semibold">{resume.title}</h2>
        </div>
        <Link
          className="rounded-xl bg-lime-300 px-5 py-3 text-sm font-semibold text-zinc-950"
          href={lessonUrl(resume)}
        >
          {recent ? 'Continue lesson' : 'Start learning'} →
        </Link>
      </div>
      <p className="mb-6 text-xs text-[var(--muted)]">
        {signedIn
          ? synced
            ? 'Account progress is synced.'
            : attempted
              ? 'Sync paused. Your progress remains saved on this device.'
              : 'Syncing account progress…'
          : 'Learning as a guest. Sign in to carry your progress between devices.'}
      </p>
      <div className="mb-8 flex flex-wrap gap-3">
        {stats.badges.map((b) => (
          <span
            key={b}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
          >
            ✦ {b}
          </span>
        ))}
        <Link href="/revision" className="underline">
          Review flashcards
        </Link>
        <Link href="/paths/dsa-interviews" className="underline">
          Explore learning paths
        </Link>
      </div>
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {['dsa', 'system-design', 'databases', 'cloud'].map((track) => {
          const lessons = catalog.filter((l) => l.track === track),
            done = lessons.filter(
              (l) => learning.progress[l.slug]?.status === 'completed',
            ).length;
          return (
            <section
              key={track}
              className="rounded-xl border border-[var(--border)] p-4"
            >
              <Link href={`/learn/${track}`} className="font-medium capitalize">
                {track.replaceAll('-', ' ')}
              </Link>
              <p className="my-2 text-xs text-[var(--muted)]">
                {done} / {lessons.length} lessons
              </p>
              <progress
                className="w-full accent-lime-600"
                aria-label={`${track} progress`}
                max={lessons.length || 1}
                value={done}
              />
            </section>
          );
        })}
      </div>
      <CatalogGrid lessons={catalog} />
    </>
  );
}
