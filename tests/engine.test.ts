import { describe, it, expect } from 'vitest';
import { freeVisualizers } from '@/engine/registry';
import { Timeline } from '@/engine/timeline';
import { createPlayerStore } from '@/engine/player-store';
import type { Frame } from '@/engine/types';
function last(frames: Frame[]) {
  return frames[frames.length - 1];
}
describe.each(Object.values(freeVisualizers))('$id', (v) => {
  it('is deterministic, immutable and serializable on every preset', () => {
    for (const input of [
      v.presets.best,
      v.presets.average,
      v.presets.worst,
      v.presets.random(8, 17),
    ]) {
      const original = [...input];
      const a = [...v.generate(v.validateInput(input))],
        b = [...v.generate(input)];
      expect(a).toEqual(b);
      expect(input).toEqual(original);
      expect(a.length).toBeGreaterThan(1);
      expect(JSON.parse(JSON.stringify(a))).toEqual(a);
      for (let i = 1; i < a.length; i++)
        for (const key of Object.keys(a[i].counters))
          expect(a[i].counters[key]).toBeGreaterThanOrEqual(
            a[i - 1].counters[key],
          );
    }
  });
  it('rejects malformed or oversized input', () => {
    expect(() => v.validateInput('bad')).toThrow();
    expect(() => v.validateInput(Array(65).fill(0))).toThrow();
    expect(() => v.validateInput([NaN])).toThrow();
  });
});
it('bubble sort returns sorted values and exact worst-case counters', () => {
  const v = freeVisualizers['bubble-sort'];
  const f = last([...v.generate([3, 2, 1])]);
  expect(f.state.values).toEqual([1, 2, 3]);
  expect(f.counters).toEqual({ comparisons: 3, swaps: 3, reads: 6, writes: 6 });
  expect(last([...v.generate([1, 2, 3])]).counters.comparisons).toBe(2);
});
it('binary search finds its deterministic target and rejects unsorted inputs', () => {
  const v = freeVisualizers['binary-search'];
  expect(last([...v.generate([1, 2, 3, 4, 5])]).state.result).toBe(2);
  expect(last([...v.generate([1, 2, 3, 4])]).state.result).toBe(3);
  expect(last([...v.generate([1, 2, 3, 4])]).counters.comparisons).toBe(3);
  expect(() => v.validateInput([2, 1])).toThrow();
});
it('stack empties in reverse order with exact reads/writes', () => {
  const frames = [...freeVisualizers.stack.generate([4, 7, 2])];
  expect(
    frames
      .filter((f) => f.variables.popped !== undefined)
      .map((f) => f.variables.popped),
  ).toEqual([2, 7, 4]);
  expect(last(frames).state.values).toEqual([]);
  expect(last(frames).counters).toEqual({
    comparisons: 0,
    swaps: 0,
    reads: 3,
    writes: 6,
  });
});
it('linear sum performs exactly n reads', () => {
  const f = last([...freeVisualizers['big-o'].generate([4, 7, 2])]);
  expect(f.state.result).toBe(13);
  expect(f.counters.reads).toBe(3);
});
it('bounded timeline recomputes old frames without mutating snapshots', () => {
  const v = freeVisualizers['bubble-sort'],
    input = v.presets.worst,
    expected = [...v.generate(input)],
    t = new Timeline(v, input, 2);
  expect(t.length).toBe(expected.length);
  expect(t.get(t.length - 1)).toEqual(last(expected));
  expect(t.get(1)).toEqual(expected[1]);
  const f = t.get(1);
  f.state.values[0] = 999;
  expect(t.get(1)).toEqual(expected[1]);
});
it('player bounds stepping and restores previous frames', () => {
  const s = createPlayerStore(4);
  s.getState().step(20);
  expect(s.getState().index).toBe(3);
  s.getState().step(-1);
  expect(s.getState().index).toBe(2);
  s.getState().setSpeed(100);
  expect(s.getState().speed).toBe(4);
  s.getState().restart();
  expect(s.getState().index).toBe(0);
});
