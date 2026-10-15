// @vitest-environment node
import { it, expect, describe } from 'vitest';
import {
  timeSpace,
  recursionBasics,
  recursionTree,
  masterTheorem,
  bits,
  twoPointers,
  slidingWindow,
  prefixSums,
} from '@/server/visualizers/foundations';
import type { Visualizer } from '@/engine/types';
const all: Visualizer<unknown>[] = [
  timeSpace,
  recursionBasics,
  recursionTree,
  masterTheorem,
  bits,
  twoPointers,
  slidingWindow,
  prefixSums,
];
describe.each(all)('$id', (v) => {
  it('runs deterministic immutable serializable preset traces', () => {
    for (const input of [
      v.presets.best,
      v.presets.average,
      v.presets.worst,
      v.presets.random(8, 42),
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
it('both duplicate detectors agree with a known pair/lookup budget', () => {
  const f = [...timeSpace.generate([1, 2, 3, 1])].at(-1)!;
  expect(f.state.result).toMatchObject({
    duplicate: true,
    hashDuplicate: true,
    pairChecks: 3,
    setLookups: 4,
    storedKeys: 3,
  });
});
it('factorial counts calls and returns with an empty stack', () => {
  const f = [...recursionBasics.generate(5)].at(-1)!;
  expect(f.state.result).toBe(120);
  expect(f.counters.calls).toBe(5);
  expect(f.counters.multiplications).toBe(4);
  expect(f.callStack).toEqual([]);
});
it('naive Fibonacci distinguishes the complete tree from active stack depth', () => {
  const frames = [...recursionTree.generate(8)],
    f = frames.at(-1)!;
  expect(f.state.result).toBe(21);
  expect(f.counters.calls).toBe(67);
  expect(f.state.nodes).toHaveLength(67);
  expect(Math.max(...frames.map((f) => f.callStack?.length ?? 0))).toBe(8);
  expect(f.callStack).toEqual([]);
});
it('the recurrence model produces exact level sums and all three theorem cases', () => {
  expect(
    [...masterTheorem.generate({ a: 2, b: 2, k: 1, n: 8 })].at(-1)!.state
      .result,
  ).toMatchObject({ case: 2, totalWork: 32 });
  expect(
    [...masterTheorem.generate({ a: 4, b: 2, k: 0, n: 8 })].at(-1)!.state
      .result,
  ).toMatchObject({ case: 1, totalWork: 85 });
  expect(
    [...masterTheorem.generate({ a: 2, b: 2, k: 2, n: 8 })].at(-1)!.state
      .result,
  ).toMatchObject({ case: 3, totalWork: 120 });
  expect(() =>
    masterTheorem.validateInput({ a: 2, b: 2, k: 1, n: 9 }),
  ).toThrow();
});
it('bit masks change only the selected bit and count set bits', () => {
  expect(
    [...bits.generate({ value: 13, bit: 2 })].at(-1)!.state.result,
  ).toEqual({
    original: 13,
    isSet: true,
    set: 13,
    cleared: 9,
    toggled: 9,
    popcount: 3,
  });
});
it('two pointers finds distinct sorted positions or an empty result', () => {
  expect(
    [...twoPointers.generate({ values: [1, 2, 4, 7, 11], target: 9 })].at(-1)!
      .state.result,
  ).toEqual([1, 3]);
  expect(
    [...twoPointers.generate({ values: [1, 2], target: 8 })].at(-1)!.state
      .result,
  ).toEqual([]);
  expect(() =>
    twoPointers.validateInput({ values: [3, 1], target: 4 }),
  ).toThrow();
});
it('fixed windows handle all-negative values', () => {
  expect(
    [...slidingWindow.generate({ values: [-3, -1, -2], window: 2 })].at(-1)!
      .state.result,
  ).toBe(-3);
});
it('prefix differences support empty and complete half-open ranges', () => {
  for (const [left, right, expected] of [
    [0, 0, 0],
    [0, 4, 8],
    [1, 4, 6],
    [2, 3, 3],
  ])
    expect(
      [...prefixSums.generate({ values: [2, -1, 3, 4], left, right })].at(-1)!
        .state.result,
    ).toBe(expected);
});
