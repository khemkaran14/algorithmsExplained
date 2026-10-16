// @vitest-environment node
import { quickHoare } from '@/server/visualizers/sorting';
import { describe, it, expect } from 'vitest';
import {
  sortingVisualizer,
  raceVisualizer,
} from '@/server/visualizers/sorting';
const ids = [
  'selection-sort',
  'insertion-sort',
  'shell-sort',
  'quick-sort',
  'heap-sort',
  'counting-sort',
  'radix-sort',
  'bucket-sort',
  'tim-sort-overview',
  'stability-explained',
];
describe.each(ids)('%s', (id) => {
  const v = sortingVisualizer(id);
  it('sorts every preset and seeded negative/duplicate inputs without mutating them', () => {
    for (const input of [
      v.presets.best,
      v.presets.average,
      v.presets.worst,
      v.presets.random(64, 23),
      [0, -2, 3, -2, 0],
      [5],
      [0, 0, 0],
    ]) {
      const before = [...input],
        frames = [...v.generate(v.validateInput(input))];
      expect(frames.at(-1)!.state.values).toEqual(
        [...input].sort((a, b) => a - b),
      );
      expect(input).toEqual(before);
      expect(frames).toEqual([...v.generate(input)]);
      expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
      for (let i = 1; i < frames.length; i++)
        for (const key of Object.keys(frames[i].counters))
          expect(frames[i].counters[key]).toBeGreaterThanOrEqual(
            frames[i - 1].counters[key],
          );
    }
  });
});
it('selection always uses n(n−1)/2 comparisons', () => {
  for (const input of [
    [1, 2, 3, 4],
    [4, 3, 2, 1],
  ])
    expect(
      [...sortingVisualizer('selection-sort').generate(input)].at(-1)!.counters
        .comparisons,
    ).toBe(6);
});
it('stable insertion retains the original order of equal records', () => {
  const f = [
    ...sortingVisualizer('stability-explained').generate([2, 1, 2, 1]),
  ].at(-1)!;
  expect(f.variables.originalIndices).toBe('1, 3, 0, 2');
});
it('the synchronized race sorts identical inputs with monotonic aggregate work', () => {
  const frames = [...raceVisualizer.generate([4, 1, 3, 2])];
  expect(frames.at(-1)!.state.result).toEqual([1, 2, 3, 4]);
  expect(frames.at(-1)!.state.rows).toEqual([
    [1, 2, 3, 4],
    [1, 2, 3, 4],
    [1, 2, 3, 4],
  ]);
  for (let i = 1; i < frames.length; i++)
    expect(frames[i].counters.comparisons).toBeGreaterThanOrEqual(
      frames[i - 1].counters.comparisons,
    );
});

it('Hoare partition sorts duplicates and adversarial shapes without mutating input', () => {
  for (const a of [
    [1],
    [1, 1, 1, 1],
    [3, 1, 2, 3, 1],
    Array.from({ length: 64 }, (_, i) => i),
    Array.from({ length: 64 }, (_, i) => 64 - i),
  ]) {
    const copy = [...a],
      frames = [...quickHoare.generate(a)];
    expect(frames.at(-1)!.state.result).toEqual([...a].sort((x, y) => x - y));
    expect(a).toEqual(copy);
    expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
  }
});
