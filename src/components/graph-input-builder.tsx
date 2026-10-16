'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { VisualCanvas } from './lesson/visual-canvas';
export function GraphInputBuilder({
  onApply,
}: {
  onApply: (value: unknown) => void;
}) {
  const [n, setN] = useState(5),
    [directed, setDirected] = useState(false),
    [edges, setEdges] = useState<[number, number, number][]>([
      [0, 1, 1],
      [0, 2, 1],
      [1, 3, 1],
    ]),
    [from, setFrom] = useState(0),
    [to, setTo] = useState(1),
    [weight, setWeight] = useState(1),
    [error, setError] = useState('');
  function resize(value: number) {
    value = Math.min(16, Math.max(1, Math.floor(value) || 1));
    setN(value);
    setEdges((old) => old.filter(([u, v]) => u < value && v < value));
    setFrom((old) => Math.min(old, value - 1));
    setTo((old) => Math.min(old, value - 1));
  }
  function add() {
    if (
      edges.some(
        ([u, v]) =>
          (u === from && v === to) || (!directed && v === from && u === to),
      )
    ) {
      setError('That edge already exists.');
      return;
    }
    setEdges((old) => [...old, [from, to, weight]]);
    setError('');
  }
  return (
    <details className="rounded-xl border border-[var(--border)] p-4">
      <summary className="cursor-pointer font-medium">
        Build a graph visually
      </summary>
      <p className="my-3 text-sm text-[var(--muted)]">
        Vertices start at zero. Applying uses free BFS, which counts hops and
        ignores weights. The JSON remains editable.
      </p>
      <fieldset className="flex flex-wrap items-end gap-3">
        <legend className="sr-only">Graph settings</legend>
        <label>
          Vertices
          <input
            aria-label="Graph vertex count"
            type="number"
            min={1}
            max={16}
            value={n}
            onChange={(e) => resize(Number(e.target.value))}
            className="mt-1 block w-24 rounded border border-[var(--border)] bg-[var(--background)] p-2"
          />
        </label>
        <label className="p-2">
          <input
            type="checkbox"
            checked={directed}
            onChange={(e) => {
              const next = e.target.checked;
              setDirected(next);
              if (!next)
                setEdges((old) =>
                  old.filter(
                    ([u, v], i) =>
                      old.findIndex(
                        ([a, b]) =>
                          Math.min(a, b) === Math.min(u, v) &&
                          Math.max(a, b) === Math.max(u, v),
                      ) === i,
                  ),
                );
            }}
          />{' '}
          Directed
        </label>
        {[
          ['From', from, setFrom],
          ['To', to, setTo],
        ].map(([label, value, setter]) => (
          <label key={String(label)}>
            {String(label)}
            <select
              aria-label={`Edge ${label}`}
              value={Number(value)}
              onChange={(e) =>
                (setter as (v: number) => void)(Number(e.target.value))
              }
              className="mt-1 block rounded border border-[var(--border)] bg-[var(--background)] p-2"
            >
              {Array.from({ length: n }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label>
          Weight
          <input
            type="number"
            aria-label="Edge weight"
            min={-999}
            max={999}
            value={weight}
            onChange={(e) =>
              setWeight(
                Math.min(
                  999,
                  Math.max(-999, Math.floor(Number(e.target.value)) || 0),
                ),
              )
            }
            className="mt-1 block w-24 rounded border border-[var(--border)] bg-[var(--background)] p-2"
          />
        </label>
        <Button type="button" variant="outline" onClick={add}>
          Add edge
        </Button>
      </fieldset>
      <p role="alert" className="my-2 text-sm text-red-600 dark:text-red-300">
        {error}
      </p>
      <VisualCanvas
        frame={{
          state: {
            kind: 'graph',
            values: Array.from({ length: n }, (_, i) => i),
            directed,
            nodes: Array.from({ length: n }, (_, i) => ({
              id: String(i),
              label: String(i),
              x: 180 + 125 * Math.cos((2 * Math.PI * i) / n - Math.PI / 2),
              y: 160 + 125 * Math.sin((2 * Math.PI * i) / n - Math.PI / 2),
            })),
            edges: edges.map(([u, v, w]) => ({
              from: String(u),
              to: String(v),
              label: String(w),
            })),
          },
          narration: 'Your editable graph',
          highlights: [],
          counters: { comparisons: 0, swaps: 0, reads: 0, writes: 0 },
          codeLine: { javascript: 1, python: 1, java: 1, cpp: 1 },
          variables: {},
        }}
      />
      <ul
        className="my-3 flex max-h-28 flex-wrap gap-2 overflow-auto"
        tabIndex={0}
        aria-label="Current graph edges"
      >
        {edges.map(([u, v, w], i) => (
          <li key={`${u}-${v}`}>
            <button
              type="button"
              className="rounded border border-[var(--border)] px-2 py-1 text-xs"
              aria-label={`Remove edge ${u} to ${v}`}
              onClick={() => setEdges((old) => old.filter((_, j) => i !== j))}
            >
              {u} {directed ? '→' : '↔'} {v} · {w} ×
            </button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        onClick={() => onApply({ n, edges, directed, start: 0, target: n - 1 })}
      >
        Use graph in BFS
      </Button>
    </details>
  );
}
