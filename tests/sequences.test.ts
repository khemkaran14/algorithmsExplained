// @vitest-environment node
import { it, expect, describe } from 'vitest';
import {
  sequenceVisualizer,
  linkedListVisualizer,
  circularQueueVisualizer,
  monotonicQueueVisualizer,
  stringVisualizer,
} from '@/server/visualizers/sequences';
import type { Visualizer } from '@/engine/types';
const visualizers: Visualizer<unknown>[] = [
  ...['arrays-dynamic-arrays', 'queue', 'deque', 'monotonic-stack'].map(
    sequenceVisualizer,
  ),
  ...(['singly', 'doubly', 'circular'] as const).map(linkedListVisualizer),
  circularQueueVisualizer(),
  monotonicQueueVisualizer(),
  stringVisualizer,
];
describe.each(visualizers)('$id', (v) => {
  it('produces immutable deterministic serializable traces for all presets', () => {
    for (const input of [
      v.presets.best,
      v.presets.average,
      v.presets.worst,
      v.presets.random(32, 7),
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
it('doubling has the exact amortized copying budget', () => {
  const f = [
    ...sequenceVisualizer('arrays-dynamic-arrays').generate([1, 2, 3, 4, 5]),
  ].at(-1)!;
  expect(f.state.result).toEqual([1, 2, 3, 4, 5]);
  expect(f.variables.capacity).toBe(8);
  expect(f.counters.reads).toBe(7);
  expect(f.counters.writes).toBe(12);
});
it('linked queue preserves FIFO and deque handles both ends', () => {
  expect(
    [...sequenceVisualizer('queue').generate([1, 2, 3, 4])].at(-1)!.state
      .result,
  ).toEqual([1, 2, 3, 4]);
  expect(
    [...sequenceVisualizer('deque').generate([1, 2, 3, 4])].at(-1)!.state
      .values,
  ).toEqual([]);
});
it.each(['singly', 'doubly', 'circular'] as const)(
  '%s list repairs links and removes only the first matching node',
  (mode) => {
    const v = linkedListVisualizer(mode);
    for (const input of [[1], [1, 2, 3, 4], [2, 2, 2]]) {
      const frames = [...v.generate(input)],
        target = input[Math.floor(input.length / 2)],
        expected = [...input];
      expected.splice(expected.indexOf(target), 1);
      expect(frames.at(-1)!.state.result).toEqual(expected);
      for (const f of frames) {
        const ids = new Set(f.state.nodes?.map((n) => n.id));
        for (const edge of f.state.edges ?? []) {
          expect(ids.has(edge.from)).toBe(true);
          expect(ids.has(edge.to)).toBe(true);
        }
      }
    }
  },
);
it('circular queue distinguishes head=tail full and empty and wraps correctly', () => {
  const v = circularQueueVisualizer(),
    f = [...v.generate({ values: [1, 2, 3, 4, 5, 6], capacity: 3 })].at(-1)!;
  expect(f.state.result).toEqual([4, 5, 6]);
  expect(f.variables).toMatchObject({ head: 0, tail: 0, size: 3, capacity: 3 });
  expect(() => v.validateInput({ values: [1], capacity: 0 })).toThrow();
});
it('next-greater stack distinguishes an absent answer from a valid negative key', () => {
  const v = sequenceVisualizer('monotonic-stack');
  expect([...v.generate([2, 1, 2, 4, 3])].at(-1)!.state.result).toEqual([
    4,
    2,
    4,
    null,
    null,
  ]);
  expect([...v.generate([-2, -1])].at(-1)!.state.result).toEqual([-1, null]);
});
it('monotonic queue matches naive sliding-window maxima on all window sizes', () => {
  const v = monotonicQueueVisualizer(),
    a = [1, 3, -1, -3, 5, 3, 6, 7];
  for (let k = 1; k <= a.length; k++) {
    const expected = a
      .slice(k - 1)
      .map((_, i) => Math.max(...a.slice(i, i + k)));
    expect(
      [...v.generate({ values: a, window: k })].at(-1)!.state.result,
    ).toEqual(expected);
  }
});
it('Unicode traversal preserves surrogate pairs and combining sequences', () => {
  const text = 'A😀e\u0301';
  const f = [...stringVisualizer.generate(text)].at(-1)!;
  expect(f.state.result).toBe(text);
  expect(f.variables).toMatchObject({ utf16Units: 5, codePoints: 4 });
  expect(f.counters.reads).toBe(4);
  expect(() => stringVisualizer.validateInput('\ud800')).toThrow();
});
