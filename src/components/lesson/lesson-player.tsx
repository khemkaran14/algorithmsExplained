'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import { CaseStudyOverview } from './case-study-overview';
import { readLearning, updateProgress } from '@/learning/local';
import { useStore } from 'zustand';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { createPlayerStore } from '@/engine/player-store';
import { Timeline } from '@/engine/timeline';
import { freeVisualizers } from '@/engine/registry';
import type { RemoteLessonData } from '@/content/server-registry';
import { randomNumbers } from '@/engine/helpers';
import type { Visualizer } from '@/engine/types';
import { LANGUAGES, type Lang } from '@/engine/types';
import type { CodeLines } from '@/content/load';
import { Button } from '@/components/ui/button';
import { VisualCanvas, VisualLegend } from './visual-canvas';
export function LessonPlayer({
  id,
  code,
  remote,
  measurements,
  trackProgress = true,
}: {
  id: string;
  code: CodeLines;
  remote?: RemoteLessonData;
  measurements?: RemoteLessonData['measurements'];
  trackProgress?: boolean;
}) {
  const [remoteData, setRemoteData] = useState(remote);
  const requestRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => () => requestRef.current?.abort(), []);

  const visualizer = useMemo<Visualizer<unknown>>(
    () =>
      remoteData
        ? {
            id,
            complexity: remoteData.complexity,
            presets: { ...remoteData.presets, random: randomNumbers },
            validateInput(raw: unknown) {
              if (typeof raw === 'string') {
                try {
                  return JSON.parse(raw) as unknown;
                } catch {
                  throw new Error('Enter valid JSON for this lesson.');
                }
              }
              return raw;
            },
            *generate() {
              yield* remoteData.frames;
            },
          }
        : freeVisualizers[id],
    [remoteData, id],
  );
  const [input, setInput] = useState<unknown>(
    remoteData?.input ?? visualizer.presets.average,
  );
  const [raw, setRaw] = useState(JSON.stringify(input));
  const [error, setError] = useState('');
  const maxRandomSize = Math.min(
    64,
    remoteData?.maxSize ?? (id === 'bfs' ? 16 : 64),
  );
  const [size, setSize] = useState(() => Math.min(8, maxRandomSize));
  useEffect(
    () => setSize((current) => Math.min(current, maxRandomSize)),
    [maxRandomSize],
  );
  const [lang, setLang] = useState<Lang>('javascript');
  const [tab, setTab] = useState('visual');
  const [mode, setMode] = useState<'watch' | 'try'>('watch');
  const [feedback, setFeedback] = useState('');
  const timeline = useMemo(
    () => new Timeline(visualizer, input),
    [visualizer, input],
  );
  const store = useMemo(() => createPlayerStore(timeline.length), [timeline]);
  const state = useStore(store);
  const current = timeline.get(state.index);
  useEffect(() => {
    if (trackProgress && state.index > 0)
      updateProgress(id, { lastFrame: state.index });
  }, [id, state.index, trackProgress]);
  useEffect(() => {
    if (!trackProgress) return;
    const started = Date.now();
    let last = started;
    const timer = setInterval(() => {
      const now = Date.now();
      if (document.visibilityState === 'visible') {
        const saved = readLearning().progress[id];
        updateProgress(id, {
          timeSpentSec: Math.min(
            86400,
            (saved?.timeSpentSec ?? 0) +
              Math.min(30, Math.floor((now - last) / 1000)),
          ),
        });
      }
      last = now;
    }, 15000);
    return () => clearInterval(timer);
  }, [id, trackProgress]);
  function nextChallenge() {
    for (
      let i = state.index + (current.action ? 1 : 0);
      i < timeline.length;
      i++
    ) {
      if (timeline.get(i).action) {
        state.seek(i);
        setFeedback('');
        return;
      }
    }
    setFeedback('You reached the end of the challenges. Try another input.');
  }

  useEffect(() => {
    if (!state.playing || mode === 'try') return;
    const timer = setInterval(() => {
      const s = store.getState();
      if (s.index >= s.length - 1) {
        s.pause();
        return;
      }
      store.setState({ index: s.index + 1 });
    }, 800 / state.speed);
    return () => clearInterval(timer);
  }, [state.playing, state.speed, store, mode]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const el = event.target;
      if (
        el instanceof HTMLElement &&
        (el.isContentEditable ||
          ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'].includes(el.tagName))
      )
        return;
      const s = store.getState();
      if (event.code === 'Space') {
        event.preventDefault();
        if (mode === 'watch') s.toggle();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        s.step(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        s.step(-1);
      } else if (event.key.toLowerCase() === 'r') s.restart();
      else if ('12345'.includes(event.key) && event.key.length === 1)
        s.setSpeed([0.25, 0.5, 1, 2, 4][Number(event.key) - 1]);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [store, mode]);
  async function load(
    next: unknown,
    random?: { kind: 'random'; size: number; seed: number },
    variant?: string,
  ) {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    store.getState().pause();
    try {
      const parsed = visualizer.validateInput(next);
      if (remoteData) {
        const response = await fetch(
          `/api/lessons/${encodeURIComponent(id)}/frames`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              random
                ? { preset: random, variant: variant ?? remoteData?.variant }
                : { input: parsed, variant: variant ?? remoteData?.variant },
            ),
          },
        );
        const data = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok)
          throw new Error(
            typeof data.error === 'string'
              ? data.error
              : 'This lesson could not be loaded.',
          );
        setRemoteData(data as RemoteLessonData);
        setInput((data as RemoteLessonData).input);
        setRaw(JSON.stringify((data as RemoteLessonData).input));
      }
      if (!remoteData) {
        setInput(parsed);
        setRaw(JSON.stringify(parsed));
      }
      setError('');
      setFeedback('');
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : 'Invalid input');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  const chart = useMemo(
    () =>
      remoteData?.measurements ??
      measurements ??
      [8, 16, 32, 64].map((n) => {
        const sample = visualizer.presets.random(
          id === 'bfs' ? Math.min(n, 16) : n,
          42,
        );
        let count = 0;
        for (const f of visualizer.generate(sample))
          count = f.counters.comparisons + f.counters.reads;
        return { n: Array.isArray(sample) ? sample.length : n, count };
      }),
    [visualizer, id, remoteData, measurements],
  );
  const chartMax = Math.max(...chart.map((p) => p.count), 1);
  return (
    <section aria-label="Interactive lesson player" className="space-y-5">
      {remoteData?.caseStudy && (
        <CaseStudyOverview spec={remoteData.caseStudy} />
      )}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border)] p-3">
        {(['best', 'average', 'worst'] as const).map((p) => (
          <Button
            key={p}
            variant="outline"
            onClick={() => load(visualizer.presets[p])}
          >
            {remoteData?.presetLabels?.[p] ??
              `${p[0].toUpperCase() + p.slice(1)} case`}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={() =>
            remoteData
              ? load(undefined, { kind: 'random', size, seed: Date.now() })
              : load(visualizer.presets.random(size, Date.now()))
          }
        >
          Random
        </Button>
        <label className="flex min-w-32 flex-1 items-center gap-2 text-sm">
          Size {size}
          <input
            aria-label="Input size"
            className="min-w-0 flex-1"
            type="range"
            min="1"
            max={maxRandomSize}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </label>
        {remoteData?.variants && (
          <div className="flex w-full items-center gap-3 text-sm">
            <label htmlFor={`variant-${id}`}>Algorithm variant</label>
            <select
              id={`variant-${id}`}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-2"
              value={remoteData.variant ?? 'default'}
              onChange={(e) => void load(undefined, undefined, e.target.value)}
            >
              {remoteData.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
          </div>
        )}
        {remoteData?.inputHint && (
          <p className="w-full text-xs text-[var(--muted)]">
            {remoteData.inputHint}
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(raw);
          }}
          className="flex w-full flex-wrap gap-2"
        >
          {remoteData?.controls && (
            <fieldset className="mb-4 flex w-full flex-wrap gap-4">
              <legend className="mb-2 font-medium">
                Simulation parameters
              </legend>
              {remoteData.controls.map((control) => {
                let values: Record<string, unknown> = {};
                try {
                  const parsed: unknown = JSON.parse(raw);
                  if (
                    parsed &&
                    typeof parsed === 'object' &&
                    !Array.isArray(parsed)
                  )
                    values = parsed as Record<string, unknown>;
                } catch {
                  /* Preserve editable JSON until the user applies it. */
                }
                const change = (value: unknown) =>
                  setRaw(JSON.stringify({ ...values, [control.key]: value }));
                return (
                  <div key={control.key} className="text-sm">
                    <label htmlFor={`control-${id}-${control.key}`}>
                      {control.label}
                    </label>
                    {control.type === 'boolean' ? (
                      <input
                        id={`control-${id}-${control.key}`}
                        type="checkbox"
                        className="ml-2"
                        checked={Boolean(values[control.key])}
                        onChange={(e) => change(e.target.checked)}
                      />
                    ) : control.type === 'select' ? (
                      <select
                        id={`control-${id}-${control.key}`}
                        className="ml-2 rounded border border-[var(--border)] bg-[var(--background)] p-2"
                        value={String(
                          values[control.key] ??
                            control.options?.[0]?.value ??
                            '',
                        )}
                        onChange={(e) => change(e.target.value)}
                      >
                        {control.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={`control-${id}-${control.key}`}
                        type="number"
                        className="ml-2 w-24 rounded border border-[var(--border)] bg-[var(--background)] p-2"
                        min={control.min}
                        max={control.max}
                        step={control.step ?? 1}
                        value={
                          typeof values[control.key] === 'number'
                            ? String(values[control.key])
                            : ''
                        }
                        onChange={(e) => change(Number(e.target.value))}
                      />
                    )}
                  </div>
                );
              })}
            </fieldset>
          )}
          <label className="sr-only" htmlFor={`custom-${id}`}>
            Custom input
          </label>
          <input
            id={`custom-${id}`}
            className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={`input-error-${id}`}
          />
          <Button variant="outline">Load input</Button>
        </form>
        <p
          id={`input-error-${id}`}
          role={error ? 'alert' : undefined}
          className="text-sm text-red-600 dark:text-red-300"
        >
          {error}
        </p>
      </div>
      <div
        className="flex flex-wrap gap-2 lg:hidden"
        role="tablist"
        aria-label="Player panels"
      >
        {['visual', 'code', 'variables'].map((t) => (
          <button
            id={`tab-${id}-${t}`}
            aria-controls={`panel-${id}-${t}`}
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-lg border border-[var(--border)] px-4 py-2 text-sm ${tab === t ? 'bg-[var(--surface)]' : ''}`}
          >
            {t}
          </button>
        ))}
      </div>
      {loading && (
        <p role="status" className="text-sm text-[var(--muted)]">
          Preparing input…
        </p>
      )}
      <div className="relative space-y-5">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div
            id={`panel-${id}-visual`}
            role="tabpanel"
            aria-labelledby={`tab-${id}-visual`}
            className={`${tab === 'visual' ? 'block' : 'hidden'} min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 lg:block`}
          >
            <div className="mb-4 flex gap-2" aria-label="Learning mode">
              {(['watch', 'try'] as const).map((m) => (
                <Button
                  key={m}
                  variant={mode === m ? 'default' : 'outline'}
                  aria-pressed={mode === m}
                  onClick={() => {
                    setMode(m);
                    state.pause();
                    setFeedback('');
                  }}
                >
                  {m === 'watch' ? 'Watch' : 'Try it yourself'}
                </Button>
              ))}
            </div>
            <VisualCanvas frame={current} />
            {mode === 'try' && (
              <section className="my-4 rounded-xl border border-[var(--border)] p-4">
                <h3 className="mb-3 font-medium">
                  {current.action?.prompt ?? 'Find the next decision point.'}
                </h3>
                {current.action ? (
                  <div className="flex flex-wrap gap-2">
                    {current.action.choices.map((choice) => (
                      <Button
                        key={choice}
                        variant="outline"
                        onClick={() => {
                          if (choice === current.action?.answer) {
                            setFeedback('✓ Correct. Watch what happens next.');
                            state.step(1);
                          } else
                            setFeedback('Not yet. ' + current.action?.hint);
                        }}
                      >
                        {choice}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => setFeedback(current.action?.hint ?? '')}
                    >
                      Hint
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={nextChallenge}>
                    Find next challenge
                  </Button>
                )}
                <p className="mt-3 text-sm" role="status">
                  {feedback}
                </p>
              </section>
            )}
            <VisualLegend />
            <p
              className="mt-5 min-h-14 border-t border-[var(--border)] pt-4 text-sm"
              aria-live="polite"
              aria-atomic="true"
            >
              {current.narration}
            </p>
          </div>
          <div
            id={`panel-${id}-code`}
            role="tabpanel"
            aria-labelledby={`tab-${id}-code`}
            className={`${tab === 'code' ? 'block' : 'hidden'} min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0d1117] text-zinc-100 lg:block`}
          >
            <label className="flex items-center justify-between border-b border-zinc-700 px-4 py-3 text-sm">
              Code language
              <select
                aria-label="Code language"
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="rounded bg-zinc-800 p-2"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <pre
              className="max-h-80 overflow-auto p-3 text-xs leading-7"
              tabIndex={0}
              aria-label="Synchronized code"
            >
              <code>
                {(remoteData?.code ?? code)[lang].map((tokens, i) => (
                  <span
                    key={i}
                    className={`block ${i + 1 === current.codeLine[lang] ? 'border-l-2 border-lime-300 bg-zinc-800' : 'border-l-2 border-transparent'}`}
                    aria-current={
                      i + 1 === current.codeLine[lang] ? 'step' : undefined
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="mr-4 inline-block w-5 select-none text-right text-zinc-500"
                    >
                      {i + 1}
                    </span>
                    {tokens.map((token, j) => (
                      <span key={j} style={{ color: token.color }}>
                        {token.content}
                      </span>
                    ))}
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </div>
        <div
          className="sticky bottom-0 z-20 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg"
          aria-label="Playback controls"
        >
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              aria-label="Restart"
              onClick={state.restart}
            >
              <RotateCcw size={18} />
            </Button>
            <Button
              variant="outline"
              aria-label="Step back"
              disabled={state.index === 0}
              onClick={() => state.step(-1)}
            >
              <SkipBack size={18} />
            </Button>
            <Button
              aria-label={state.playing ? 'Pause' : 'Play'}
              disabled={state.index === state.length - 1 || mode === 'try'}
              onClick={state.toggle}
            >
              {state.playing ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            <Button
              variant="outline"
              aria-label="Step forward"
              disabled={state.index === state.length - 1}
              onClick={() => state.step(1)}
            >
              <SkipForward size={18} />
            </Button>
            <label className="flex items-center gap-1 text-xs">
              Speed
              <select
                aria-label="Playback speed"
                value={state.speed}
                onChange={(e) => state.setSpeed(Number(e.target.value))}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"
              >
                {[0.25, 0.5, 1, 2, 4].map((s) => (
                  <option key={s} value={s}>
                    {s}×
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              className="min-w-0 flex-1 accent-lime-600"
              type="range"
              min="0"
              max={state.length - 1}
              value={state.index}
              onChange={(e) => state.seek(Number(e.target.value))}
              aria-label="Animation timeline"
            />
            <output
              className="w-20 text-right font-mono text-xs"
              aria-label="Current frame"
            >
              {state.index + 1} / {state.length}
            </output>
          </div>
        </div>
      </div>
      <div
        id={`panel-${id}-variables`}
        role="tabpanel"
        aria-labelledby={`tab-${id}-variables`}
        className={`${tab === 'variables' ? 'block' : 'hidden'} grid gap-4 sm:grid-cols-2 lg:grid`}
      >
        <section className="rounded-2xl border border-[var(--border)] p-4">
          <h2 className="mb-3 text-sm font-semibold">Live variables</h2>
          <dl className="flex flex-wrap gap-4 font-mono text-xs">
            {Object.entries(current.variables).map(([k, v]) => (
              <div key={k}>
                <dt className="text-[var(--muted)]">{k}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
          </dl>
          {current.callStack && (
            <ol>
              {current.callStack.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          )}
        </section>
        <section className="rounded-2xl border border-[var(--border)] p-4">
          <h2 className="mb-3 text-sm font-semibold">Operation counters</h2>
          <dl className="flex flex-wrap gap-4 font-mono text-xs">
            {Object.entries(current.counters).map(([k, v]) => (
              <div key={k}>
                <dt className="text-[var(--muted)]">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      {current.state.result !== undefined && (
        <details className="rounded-2xl border border-[var(--border)] p-5" open>
          <summary className="cursor-pointer font-semibold">
            Algorithm result
          </summary>
          <pre
            tabIndex={0}
            aria-label="Algorithm result data"
            className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words font-mono text-xs"
          >
            {JSON.stringify(current.state.result, null, 2)}
          </pre>
        </details>
      )}
      <details className="rounded-2xl border border-[var(--border)] p-5" open>
        <summary className="cursor-pointer font-semibold">
          Complexity · {visualizer.complexity.worst}
        </summary>
        <dl className="my-4 grid grid-cols-2 gap-3 font-mono text-sm sm:grid-cols-4">
          {Object.entries(visualizer.complexity)
            .filter(([k]) => ['best', 'average', 'worst', 'space'].includes(k))
            .map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-[var(--muted)]">{k}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
        </dl>
        <p className="mb-4 text-sm text-[var(--muted)]">
          {visualizer.complexity.why}
        </p>
        <div
          role="img"
          aria-label={`${visualizer.complexity.metric?.label ?? 'Measured reads plus comparisons'} by input size`}
          className="space-y-2"
        >
          {chart.map((p, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-mono">n={p.n}</span>
              <div
                className="h-5 min-w-1 rounded bg-lime-600"
                style={{ width: `${Math.max(1, (p.count / chartMax) * 70)}%` }}
              />
              <span className="font-mono">{p.count}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          {visualizer.complexity.metric?.label ??
            'Measured reads + comparisons'}
          , seed 42. Plotted sample sizes respect each lesson’s explicit input
          limits.
        </p>
      </details>
      <p className="text-xs text-[var(--muted)]">
        Keyboard: Space play/pause · ←/→ step · R restart · 1–5 speed. Reduced
        motion disables transitions.
      </p>
    </section>
  );
}
