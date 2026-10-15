import { describe, it, expect } from 'vitest';
import {
  hashFunction,
  chainingVisualizer,
  openAddressing,
  bloom,
  consistentHashing,
} from '@/server/visualizers/hashing';
import type { Visualizer, JsonValue } from '@/engine/types';
const all = [
  hashFunction,
  chainingVisualizer(),
  chainingVisualizer(true),
  openAddressing,
  bloom,
  consistentHashing,
] as Visualizer<unknown>[];
describe.each(all)('$id', (v) => {
  it('produces deterministic immutable serializable preset traces', () => {
    for (const raw of [
      v.presets.best,
      v.presets.average,
      v.presets.worst,
      v.presets.random(8, 42),
    ]) {
      const input = v.validateInput(raw),
        copy = structuredClone(input),
        frames = [...v.generate(input)];
      expect(frames.length).toBeGreaterThan(1);
      expect(frames).toEqual([...v.generate(input)]);
      expect(input).toEqual(copy);
      expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
    }
  });
});
it('rolling hash matches an independent ASCII calculation', () => {
  expect(
    [...hashFunction.generate({ text: 'hello', modulus: 7 })].at(-1)!.state
      .result,
  ).toBe(0);
  expect(() => hashFunction.validateInput({ text: 'ह', modulus: 7 })).toThrow();
});
it('chaining checks duplicates and removes only the matching key', () => {
  const f = [...chainingVisualizer().generate([-5, 0, 5, 5, 10])].at(-1)!;
  expect(f.state.result).toMatchObject({
    keys: [-5, 0, 10],
    size: 3,
    capacity: 5,
  });
});
it('rehashing preserves all distinct keys and its projected load bound', () => {
  const keys = Array.from({ length: 64 }, (_, i) => i - 32),
    frames = [...chainingVisualizer(true).generate(keys)];
  const result = frames.at(-1)!.state.result as {
    keys: number[];
    capacity: number;
    size: number;
  };
  expect(result.keys).toEqual(keys);
  expect(result.size / result.capacity).toBeLessThanOrEqual(0.75);
  expect(frames.at(-1)!.counters.transfers).toBeLessThan(keys.length * 3);
});
it.each(['linear', 'double'] as const)(
  '%s probing uses all slots and terminates on a full table',
  (method) => {
    const f = [
      ...openAddressing.generate({
        keys: [0, 5, 10, 15, 20, 25],
        capacity: 5,
        method,
      }),
    ].at(-1)!;
    expect(f.state.result).toMatchObject({ failed: [25] });
    expect(f.counters.probes).toBeLessThanOrEqual(30);
  },
);
it('quadratic probing reports unreachable free slots instead of looping', () => {
  const f = [
    ...openAddressing.generate({
      keys: [0, 5, 10, 15],
      capacity: 5,
      method: 'quadratic',
    }),
  ].at(-1)!;
  expect(f.state.result).toMatchObject({ failed: [15] });
});
it('Bloom insertions have no false negatives and negatives are sound', () => {
  const inserted = Array.from({ length: 30 }, (_, i) => i),
    f = [
      ...bloom.generate({
        insert: inserted,
        query: [...inserted, 100, 101],
        bits: 32,
        hashes: 3,
        seed: 42,
      }),
    ].at(-1)!;
  const result = f.state.result as {
    queries: { key: number; maybePresent: boolean; actualMember: boolean }[];
  };
  for (const q of result.queries) {
    if (q.actualMember) expect(q.maybePresent).toBe(true);
    if (!q.maybePresent) expect(q.actualMember).toBe(false);
  }
});
it('adding a ring node moves keys only to that new node', () => {
  const f = [
    ...consistentHashing.generate({
      nodes: [1, 2, 3],
      keys: Array.from({ length: 64 }, (_, i) => i),
      replicas: 4,
      seed: 42,
      change: { type: 'add', node: 4 },
    }),
  ].at(-1)!;
  const result = f.state.result as { migrated: { from: number; to: number }[] };
  expect(result.migrated.length).toBeGreaterThan(0);
  for (const move of result.migrated) expect(move.to).toBe(4);
});
it('removing a node moves only its previous keys', () => {
  const f = [
    ...consistentHashing.generate({
      nodes: [1, 2, 3],
      keys: Array.from({ length: 64 }, (_, i) => i),
      replicas: 4,
      seed: 42,
      change: { type: 'remove', node: 2 },
    }),
  ].at(-1)!;
  const result = f.state.result as {
    migrated: { from: number; to: number }[];
    after: Record<string, JsonValue>;
  };
  for (const move of result.migrated) {
    expect(move.from).toBe(2);
    expect(move.to).not.toBe(2);
  }
  expect(Object.values(result.after)).not.toContain(2);
});
it('rejects invalid ring membership changes and unsafe capacities', () => {
  expect(() =>
    consistentHashing.validateInput({
      nodes: [1],
      keys: [1],
      replicas: 2,
      seed: 42,
      change: { type: 'remove', node: 1 },
    }),
  ).toThrow();
  expect(() =>
    openAddressing.validateInput({ keys: [1], capacity: 6, method: 'double' }),
  ).toThrow();
});
