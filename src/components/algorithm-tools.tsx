'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { LessonMeta } from '@/content/types';
import type { RemoteLessonData } from '@/content/server-registry';
import type { CodeLines } from '@/content/load';
import { LessonPlayer } from './lesson/lesson-player';
import { VisualCanvas } from './lesson/visual-canvas';
import { Button } from './ui/button';
type Run = {
  slug: string;
  title: string;
  data: RemoteLessonData;
  code: CodeLines;
};
export function AlgorithmTools({
  mode,
  lessons,
}: {
  mode: 'playground' | 'compare';
  lessons: LessonMeta[];
}) {
  const [selected, setSelected] = useState<string[]>(
      mode === 'compare'
        ? ['bubble-sort', 'insertion-sort']
        : [lessons[0]?.slug ?? 'bubble-sort'],
    ),
    [raw, setRaw] = useState('[4,1,6,2,5,3]'),
    [runs, setRuns] = useState<Run[]>([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1);
  const request = useRef<AbortController | null>(null),
    revision = useRef(0);
  useEffect(() => () => request.current?.abort(), []);
  const length = Math.max(1, ...runs.map((r) => r.data.frames.length));
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () =>
        setIndex((i) => {
          if (i >= length - 1) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        }),
      800 / speed,
    );
    return () => clearInterval(timer);
  }, [playing, length, speed]);
  async function run() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setPlaying(false);
    setError('');
    try {
      const input: unknown = JSON.parse(raw);
      const response = await fetch('/api/tools/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, slugs: selected, input }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error ?? 'Unable to run algorithms.');
      if (controller.signal.aborted) return;
      revision.current++;
      setRuns(data as Run[]);
      setIndex(0);
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : 'Use valid JSON input.');
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
        className="space-y-4 rounded-2xl border border-[var(--border)] p-5"
      >
        <fieldset>
          <legend className="mb-2 font-semibold">
            {mode === 'compare'
              ? 'Choose two or three sorts'
              : 'Choose a free algorithm'}
          </legend>
          <div
            className="flex max-h-56 flex-wrap gap-3 overflow-auto"
            tabIndex={0}
          >
            {lessons.map((l) => (
              <label
                key={l.slug}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
              >
                <input
                  type={mode === 'compare' ? 'checkbox' : 'radio'}
                  name="algorithm"
                  checked={selected.includes(l.slug)}
                  onChange={() =>
                    setSelected((old) =>
                      mode === 'playground'
                        ? [l.slug]
                        : old.includes(l.slug)
                          ? old.filter((s) => s !== l.slug)
                          : old.length < 3
                            ? [...old, l.slug]
                            : old,
                    )
                  }
                />
                {l.title}
                {!l.isFree ? ' · All Access' : ''}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block font-medium">
          Shared JSON input
          <textarea
            className="mt-2 min-h-24 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            aria-describedby="input-help"
          />
        </label>
        <p id="input-help" className="text-sm text-[var(--muted)]">
          {mode === 'compare'
            ? 'Every sort receives an independent copy of the same integer array. Steps represent teaching events, not elapsed CPU time.'
            : 'Use the input format documented in the selected lesson. Arrays use [4,1,6,2,5,3]. Structured inputs use JSON objects.'}
        </p>
        <Button disabled={busy}>
          {busy ? 'Preparing…' : 'Run algorithms'}
        </Button>
        <p role="alert" className="text-red-600 dark:text-red-300">
          {error}
        </p>
      </form>
      {mode === 'playground'
        ? runs.map((r) => (
            <section key={`${r.slug}-${revision.current}`}>
              <h2 className="mb-4 text-2xl font-semibold">{r.title}</h2>
              <LessonPlayer
                id={r.slug}
                code={r.code}
                remote={r.data}
                trackProgress={false}
              />
            </section>
          ))
        : runs.length > 0 && (
            <section aria-label="Synchronized comparison" className="space-y-4">
              <div className="sticky top-2 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                <Button onClick={() => setPlaying((p) => !p)}>
                  {playing ? 'Pause' : 'Play'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPlaying(false);
                    setIndex((i) => Math.max(0, i - 1));
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPlaying(false);
                    setIndex((i) => Math.min(length - 1, i + 1));
                  }}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPlaying(false);
                    setIndex(0);
                  }}
                >
                  Restart
                </Button>
                <label>
                  Speed{' '}
                  <select
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="rounded border border-[var(--border)] bg-[var(--background)] p-2"
                  >
                    {[0.25, 0.5, 1, 2, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}×
                      </option>
                    ))}
                  </select>
                </label>
                <input
                  className="min-w-24 flex-1"
                  type="range"
                  aria-label="Comparison step"
                  min={0}
                  max={length - 1}
                  value={index}
                  onChange={(e) => {
                    setPlaying(false);
                    setIndex(Number(e.target.value));
                  }}
                />
                <span className="font-mono text-xs">
                  {index + 1}/{length}
                </span>
              </div>
              <div
                className={`grid gap-5 ${runs.length === 3 ? 'xl:grid-cols-3' : 'lg:grid-cols-2'}`}
              >
                {runs.map((r) => {
                  const f =
                    r.data.frames[Math.min(index, r.data.frames.length - 1)];
                  return (
                    <article
                      key={r.slug}
                      className="min-w-0 rounded-xl border border-[var(--border)] p-4"
                    >
                      <h2 className="text-xl font-semibold">{r.title}</h2>
                      <p className="my-2 text-xs">
                        {r.data.complexity.worst} worst time ·{' '}
                        {r.data.complexity.space} space
                      </p>
                      <VisualCanvas frame={f} />
                      <p className="my-3 min-h-14 text-sm">{f.narration}</p>
                      <dl className="grid grid-cols-2 gap-2 font-mono text-xs">
                        {Object.entries(f.counters).map(([key, value]) => (
                          <div key={key}>
                            <dt>{key}</dt>
                            <dd>{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
      <p className="text-sm text-[var(--muted)]">
        Experimental runs do not mark lessons complete.{' '}
        <Link href="/learn" className="underline">
          Open the curriculum
        </Link>{' '}
        for explanations and quizzes.
      </p>
    </div>
  );
}
