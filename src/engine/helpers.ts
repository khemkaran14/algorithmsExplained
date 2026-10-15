import type { Frame, VisualState, Counters, Highlight } from './types';
export function validateNumbers(raw: unknown): number[] {
  let value: unknown = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      throw new Error('Enter a JSON array such as [5, 2, 8].');
    }
  }
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > 64 ||
    !value.every(
      (v) =>
        typeof v === 'number' &&
        Number.isFinite(v) &&
        Number.isInteger(v) &&
        Math.abs(v) <= 999,
    )
  )
    throw new Error('Use 1–64 whole numbers between -999 and 999.');
  return [...value] as number[];
}
export function randomNumbers(n: number, seed = 42): number[] {
  let s = seed >>> 0;
  return Array.from(
    { length: Math.min(64, Math.max(1, Math.floor(n))) },
    () => {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return 1 + (s % 99);
    },
  );
}
export function counters(): Counters {
  return { comparisons: 0, swaps: 0, reads: 0, writes: 0 };
}
export function frame(
  state: VisualState,
  narration: string,
  c: Counters,
  line: number,
  variables: Frame['variables'] = {},
  highlights: Highlight[] = [],
  action?: Frame['action'],
): Frame {
  return structuredClone({
    state,
    narration,
    counters: c,
    codeLine: { javascript: line, python: line, java: line, cpp: line },
    variables,
    highlights,
    ...(action ? { action } : {}),
  });
}
export function arrayPresets() {
  return {
    best: [1, 2, 3, 4, 5, 6],
    average: [4, 1, 6, 2, 5, 3],
    worst: [6, 5, 4, 3, 2, 1],
    random: randomNumbers,
  };
}

export function withLineMap(
  visualizer: import('./types').Visualizer,
  maps: Partial<Record<import('./types').Lang, Record<number, number>>>,
): import('./types').Visualizer {
  return {
    ...visualizer,
    *generate(input) {
      for (const f of visualizer.generate(input)) {
        for (const lang of Object.keys(maps) as import('./types').Lang[])
          f.codeLine[lang] = maps[lang]?.[f.codeLine[lang]] ?? f.codeLine[lang];
        yield f;
      }
    },
  };
}
