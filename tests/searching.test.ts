// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { searchVisualizer } from '@/server/visualizers/searching';
const ids = [
  'linear-search',
  'lower-upper-bound',
  'ternary-search',
  'exponential-search',
  'interpolation-search',
  'binary-search-on-answer',
];
describe.each(ids)('%s', (id) => {
  const v = searchVisualizer(id);
  it('runs valid presets deterministically with serializable snapshots', () => {
    for (const input of [
      v.presets.best,
      v.presets.average,
      v.presets.worst,
      v.presets.random(64, 31),
    ]) {
      const before = structuredClone(input),
        frames = [...v.generate(v.validateInput(input))];
      expect(frames.length).toBeGreaterThan(1);
      expect(frames).toEqual([...v.generate(input)]);
      expect(input).toEqual(before);
      expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
    }
  });
});
describe.each([
  'linear-search',
  'ternary-search',
  'exponential-search',
  'interpolation-search',
])('%s results', (id) => {
  it('finds duplicates/boundaries and reports absent keys', () => {
    const v = searchVisualizer(id);
    for (const a of [
      [1],
      [1, 1, 1],
      [1, 2, 2, 4, 8],
      [1, 2, 3, 999],
      [-9, -4, 0, 3],
    ])
      for (const target of [-10, -4, 0, 1, 2, 3, 8, 999, 1000]) {
        const f = [...v.generate({ values: a, target })].at(-1)!;
        const index = f.state.result as number;
        if (a.includes(target)) expect(a[index]).toBe(target);
        else expect(index).toBe(-1);
      }
  });
});
it('lower/upper bound return correct half-open equal ranges', () => {
  const v = searchVisualizer('lower-upper-bound');
  for (const target of [0, 1, 2, 3, 9]) {
    const a = [1, 2, 2, 2, 4];
    const lower = a.findIndex((x) => x >= target),
      upper = a.findIndex((x) => x > target);
    expect([...v.generate({ values: a, target })].at(-1)!.state.result).toEqual(
      [lower < 0 ? a.length : lower, upper < 0 ? a.length : upper],
    );
  }
});
it('binary search on capacity finds the proven optimum and enforces nonnegative weights', () => {
  const v = searchVisualizer('binary-search-on-answer');
  expect(
    [...v.generate({ weights: [7, 2, 5, 10, 8], groups: 2 })].at(-1)!.state
      .result,
  ).toBe(18);
  expect(
    [...v.generate({ weights: [0, 0, 0], groups: 2 })].at(-1)!.state.result,
  ).toBe(0);
  expect(() => v.validateInput({ weights: [-1, 2], groups: 1 })).toThrow();
});
it('linear search counts one comparison and read per inspected value', () => {
  const v = searchVisualizer('linear-search');
  expect(
    [...v.generate({ values: [3, 1, 5], target: 5 })].at(-1)!.counters,
  ).toMatchObject({ comparisons: 3, reads: 3 });
});
