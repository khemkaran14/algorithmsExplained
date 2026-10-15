// @vitest-environment node
import { it, expect, describe } from 'vitest';
import {
  gcd,
  sieve,
  primality,
  fastExponentiation,
  hanoi,
  reservoir,
  kmeans,
  pageRank,
  cacheVisualizer,
} from '@/server/visualizers/math';
import type { Visualizer } from '@/engine/types';
const all: Visualizer<unknown>[] = [
  gcd,
  sieve,
  primality,
  fastExponentiation,
  hanoi,
  reservoir,
  kmeans,
  pageRank,
  cacheVisualizer('lru'),
  cacheVisualizer('lfu'),
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
it('Euclid preserves the known GCD and counts remainders', () => {
  const f = [...gcd.generate({ a: 48, b: 18 })].at(-1)!;
  expect(f.state.result).toBe(6);
  expect(f.counters.remainders).toBe(3);
  expect([...gcd.generate({ a: 0, b: 0 })].at(-1)!.state.result).toBe(0);
});
it('sieve and trial division agree on all small integers', () => {
  const primes = [...sieve.generate(100)].at(-1)!.state.result as number[];
  expect(primes).toHaveLength(25);
  for (let n = 0; n <= 100; n++)
    expect([...primality.generate(n)].at(-1)!.state.result).toBe(
      primes.includes(n),
    );
  expect([...primality.generate(999983)].at(-1)!.state.result).toBe(true);
});
it('binary exponentiation returns exact integers with logarithmically many multiplications', () => {
  const f = [...fastExponentiation.generate({ base: 2, exponent: 13 })].at(-1)!;
  expect(f.state.result).toBe('8192');
  expect(f.counters.multiplications).toBe(6);
  expect(
    [...fastExponentiation.generate({ base: -3, exponent: 9 })].at(-1)!.state
      .result,
  ).toBe('-19683');
  expect(
    [...fastExponentiation.generate({ base: 99, exponent: 31 })].at(-1)!.state
      .result,
  ).toBe((99n ** 31n).toString());
});
it('Hanoi performs exactly 2^n−1 legal moves and empties the source', () => {
  for (let n = 1; n <= 6; n++) {
    const frames = [...hanoi.generate(n)];
    for (const f of frames)
      for (const peg of f.state.rows ?? [])
        expect(peg.every((disk, i) => i === 0 || peg[i - 1] > disk)).toBe(true);
    expect(frames.at(-1)!.state.result).toEqual({
      moves: 2 ** n - 1,
      pegs: [[], [], Array.from({ length: n }, (_, i) => n - i)],
    });
  }
});
it('reservoir uses unbiased-bound draws with a reproducible expected sample', () => {
  expect(
    [...reservoir.generate({ values: [1, 2, 3, 4, 5], k: 2, seed: 42 })].at(-1)!
      .state.result,
  ).toEqual([4, 3]);
  expect(() => reservoir.validateInput({ values: [1], k: 2 })).toThrow();
});
it('Lloyd updates never increase squared error and separate two simple groups', () => {
  const frames = [
    ...kmeans.generate({
      points: [
        [-8, -8],
        [-6, -6],
        [6, 6],
        [8, 8],
      ],
      k: 2,
      iterations: 6,
      seed: 42,
    }),
  ];
  const errors = frames
    .filter((f) => typeof f.variables.sse === 'number')
    .map((f) => Number(f.variables.sse));
  for (let i = 1; i < errors.length; i++)
    expect(errors[i]).toBeLessThanOrEqual(errors[i - 1] + 1e-10);
  const result = frames.at(-1)!.state.result as {
    centroids: number[][];
    assignments: number[];
  };
  expect(result.centroids.map((p) => p[0]).sort((a, b) => a - b)).toEqual([
    -7, 7,
  ]);
  expect(result.assignments[0]).toBe(result.assignments[1]);
  expect(result.assignments[2]).toBe(result.assignments[3]);
  expect(result.assignments[0]).not.toBe(result.assignments[2]);
});
it('PageRank conserves probability even with dangling pages', () => {
  const frames = [
    ...pageRank.generate({
      n: 3,
      edges: [
        [0, 1, 1],
        [1, 2, 1],
      ],
      directed: true,
      start: 0,
      damping: 0.85,
      iterations: 20,
    }),
  ];
  for (const f of frames)
    if (typeof f.variables.total === 'number')
      expect(f.variables.total).toBeCloseTo(1, 12);
  const ranks = frames.at(-1)!.state.result as number[];
  expect(ranks.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
  expect(ranks[2]).toBeGreaterThan(ranks[0]);
});
it('LRU evicts by recency and LFU uses LRU ties within frequency buckets', () => {
  const lru = [
    ...cacheVisualizer('lru').generate({ accesses: [1, 2, 1, 3], capacity: 2 }),
  ].at(-1)!.state.result as { evicted: number[]; hits: number };
  expect(lru).toMatchObject({ evicted: [2], hits: 1 });
  const lfu = [
    ...cacheVisualizer('lfu').generate({
      accesses: [1, 2, 1, 3, 3, 4],
      capacity: 2,
    }),
  ].at(-1)!.state.result as { evicted: number[] };
  expect(lfu.evicted).toEqual([2, 1]);
});
