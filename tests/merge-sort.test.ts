import { it, expect } from 'vitest';
import mergeSort from '../content/dsa/sorting/merge-sort/visualizer';
it('merge sort returns stable ordered values, exact counters and an empty final call stack', () => {
  const input = [4, 3, 2, 1],
    frames = [...mergeSort.generate(input)],
    last = frames.at(-1)!;
  expect(last.state.values).toEqual([1, 2, 3, 4]);
  expect(input).toEqual([4, 3, 2, 1]);
  expect(last.counters).toEqual({
    comparisons: 4,
    swaps: 0,
    reads: 16,
    writes: 8,
  });
  expect(last.callStack).toEqual([]);
  expect(frames.some((f) => (f.callStack?.length ?? 0) > 1)).toBe(true);
});
it('merge sort handles every preset and duplicates deterministically', () => {
  for (const input of [
    mergeSort.presets.best,
    mergeSort.presets.average,
    mergeSort.presets.worst,
    mergeSort.presets.random(64, 42),
    [2, 1, 2, -1],
  ]) {
    const trace = [...mergeSort.generate(input)];
    expect(trace.at(-1)!.state.values).toEqual(
      [...input].sort((a, b) => a - b),
    );
    expect(trace).toEqual([...mergeSort.generate(input)]);
    expect(JSON.parse(JSON.stringify(trace))).toEqual(trace);
  }
});
