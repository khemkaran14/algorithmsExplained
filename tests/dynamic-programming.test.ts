import { it, expect, describe } from 'vitest';
import {
  introduction,
  fibonacci,
  coinChange,
  knapsack,
  sequencePair,
  lis,
  matrixChain,
  gridDp,
  treeDp,
  divideConquer,
} from '@/server/visualizers/dynamic-programming';
import { greedy, backtracking } from '@/server/visualizers/greedy-backtracking';
import type { Visualizer } from '@/engine/types';
const all = [
  introduction,
  fibonacci(),
  fibonacci(true),
  coinChange,
  knapsack,
  sequencePair(),
  sequencePair(true),
  lis,
  matrixChain,
  gridDp,
  treeDp,
  divideConquer,
  greedy,
  backtracking,
] as Visualizer<unknown>[];
describe.each(all)('$id', (v) =>
  it('has deterministic immutable serializable preset traces', () => {
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
      expect(frames.length).toBeLessThanOrEqual(10000);
      expect(frames).toEqual([...v.generate(input)]);
      expect(input).toEqual(copy);
      expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
    }
  }),
);
it('stair DP agrees with exhaustive nonnegative paths', () => {
  for (const costs of [
    [4],
    [10, 15, 20],
    [1, 100, 1, 1, 1, 100, 1, 1, 100, 1],
  ]) {
    function brute(i: number): number {
      if (i >= costs.length) return 0;
      return costs[i] + Math.min(brute(i + 1), brute(i + 2));
    }
    const expected = Math.min(brute(0), brute(1));
    expect(
      [...introduction.generate(costs)].at(-1)!.state.result,
    ).toMatchObject({ cost: expected });
  }
});
it('memoized and tabulated Fibonacci agree with exact iterative arithmetic', () => {
  let a = 0n,
    b = 1n;
  for (let n = 0; n <= 64; n++) {
    for (const memo of [false, true])
      expect(
        [...fibonacci(memo).generate(n)].at(-1)!.state.result,
      ).toMatchObject({ value: a.toString() });
    [a, b] = [b, a + b];
  }
});
it('coin change distinguishes minimum count, unreachable amounts and unordered combinations', () => {
  expect(
    [
      ...coinChange.generate({ coins: [1, 3, 4], amount: 6, mode: 'minimum' }),
    ].at(-1)!.state.result,
  ).toMatchObject({ minimum: 2, coins: [3, 3] });
  expect(
    [...coinChange.generate({ coins: [2], amount: 3, mode: 'minimum' })].at(-1)!
      .state.result,
  ).toMatchObject({ minimum: null, coins: [] });
  expect(
    [
      ...coinChange.generate({
        coins: [1, 2, 5, 2],
        amount: 5,
        mode: 'combinations',
      }),
    ].at(-1)!.state.result,
  ).toEqual({ combinations: 4 });
  expect(
    [
      ...coinChange.generate({ coins: [2], amount: 0, mode: 'combinations' }),
    ].at(-1)!.state.result,
  ).toEqual({ combinations: 1 });
});
it('0/1 knapsack agrees with subset enumeration and never reuses an item', () => {
  for (let seed = 1; seed <= 8; seed++) {
    const weights = Array.from({ length: 8 }, (_, i) => ((i + seed) % 5) + 1),
      values = weights.map((w, i) => w * 2 + i),
      capacity = seed + 4;
    let best = 0;
    for (let mask = 0; mask < 256; mask++) {
      let w = 0,
        v = 0;
      for (let i = 0; i < 8; i++)
        if ((mask >> i) & 1) {
          w += weights[i];
          v += values[i];
        }
      if (w <= capacity) best = Math.max(best, v);
    }
    const r = [...knapsack.generate({ weights, values, capacity })].at(-1)!
      .state.result as { value: number; items: number[]; totalWeight: number };
    expect(r.value).toBe(best);
    expect(new Set(r.items).size).toBe(r.items.length);
    expect(r.totalWeight).toBeLessThanOrEqual(capacity);
  }
});
it('LCS reconstructs an ordered common subsequence and edit distance handles empty prefixes', () => {
  expect(
    [...sequencePair().generate({ a: 'abcde', b: 'ace' })].at(-1)!.state.result,
  ).toEqual({ length: 3, subsequence: 'ace' });
  for (const [a, b, distance] of [
    ['kitten', 'sitting', 3],
    ['', 'abc', 3],
    ['abc', '', 3],
    ['same', 'same', 0],
    ['ab', 'ba', 2],
  ] as const)
    expect(
      [...sequencePair(true).generate({ a, b })].at(-1)!.state.result,
    ).toMatchObject({ distance });
});
it('strict LIS agrees with exhaustive subsets and reconstructs source indices', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const values = lis.presets.random(9, seed).map((v) => v % 6);
    let best = 0;
    for (let mask = 0; mask < 512; mask++) {
      const sub = values.filter((_, i) => (mask >> i) & 1);
      if (sub.every((v, i) => i === 0 || sub[i - 1] < v))
        best = Math.max(best, sub.length);
    }
    const r = [...lis.generate(values)].at(-1)!.state.result as {
      length: number;
      indices: number[];
      subsequence: number[];
    };
    expect(r.length).toBe(best);
    expect(r.subsequence).toEqual(r.indices.map((i) => values[i]));
    expect(
      r.subsequence.every((v, i) => i === 0 || r.subsequence[i - 1] < v),
    ).toBe(true);
  }
});
it('matrix-chain interval DP matches canonical scalar counts', () => {
  expect(
    [...matrixChain.generate([30, 35, 15, 5, 10, 20, 25])].at(-1)!.state.result,
  ).toMatchObject({ cost: 15125 });
  expect(
    [...matrixChain.generate([10, 30, 5, 60])].at(-1)!.state.result,
  ).toMatchObject({ cost: 4500 });
  expect(
    [...matrixChain.generate([10, 20])].at(-1)!.state.result,
  ).toMatchObject({ cost: 0, parenthesization: 'A1' });
});
it('grid DP handles obstacles, blocked endpoints, negative costs and a reconstructed path', () => {
  expect(
    [
      ...gridDp.generate({
        cells: [
          [1, 1, 1],
          [1, null, 1],
          [1, 1, 1],
        ],
        mode: 'paths',
      }),
    ].at(-1)!.state.result,
  ).toMatchObject({ value: 2 });
  expect(
    [
      ...gridDp.generate({
        cells: [
          [null, 1],
          [1, 1],
        ],
        mode: 'minimum-cost',
      }),
    ].at(-1)!.state.result,
  ).toEqual({ value: null, path: [] });
  expect(
    [
      ...gridDp.generate({
        cells: [
          [1, -2],
          [3, 1],
        ],
        mode: 'minimum-cost',
      }),
    ].at(-1)!.state.result,
  ).toEqual({
    value: 0,
    path: [
      [0, 0],
      [0, 1],
      [1, 1],
    ],
  });
});
it('tree independent-set DP agrees with exhaustive compatible vertex sets', () => {
  const parents = [-1, 0, 0, 1, 1, 2, 2, 3],
    weights = [4, 5, 6, 2, 3, 8, 1, 9];
  let best = 0;
  for (let mask = 0; mask < 256; mask++) {
    if (parents.some((p, i) => p >= 0 && (mask >> i) & 1 && (mask >> p) & 1))
      continue;
    best = Math.max(
      best,
      weights.reduce((sum, w, i) => sum + ((mask >> i) & 1 ? w : 0), 0),
    );
  }
  const r = [...treeDp.generate({ parents, weights })].at(-1)!.state.result as {
    value: number;
    selected: number[];
  };
  expect(r.value).toBe(best);
  for (const i of r.selected) expect(r.selected).not.toContain(parents[i]);
  expect(r.selected.reduce((sum, i) => sum + weights[i], 0)).toBe(best);
});
it('divide-and-conquer maximum subarray agrees with exhaustive nonempty intervals', () => {
  for (const input of [
    [-5, -2, -8],
    [0],
    [2, -3, 4, -1, 2, 1, -5, 4],
    ...Array.from({ length: 10 }, (_, i) =>
      lis.presets.random(12, i).map((v) => v - 50),
    ),
  ]) {
    let best = -Infinity;
    for (let i = 0; i < input.length; i++) {
      let sum = 0;
      for (let j = i; j < input.length; j++) {
        sum += input[j];
        best = Math.max(best, sum);
      }
    }
    const r = [...divideConquer.generate(input)].at(-1)!.state.result as {
      sum: number;
      start: number;
      end: number;
    };
    expect(r.sum).toBe(best);
    expect(input.slice(r.start, r.end).reduce((a, b) => a + b, 0)).toBe(best);
  }
});
it('greedy interval scheduling maximizes count and fractional packing uses the final fraction', () => {
  expect(
    [
      ...greedy.generate({
        mode: 'activities',
        intervals: [
          [1, 3],
          [2, 5],
          [3, 4],
          [4, 7],
          [6, 8],
        ],
      }),
    ].at(-1)!.state.result,
  ).toMatchObject({ count: 3 });
  expect(
    [
      ...greedy.generate({
        mode: 'fractional-knapsack',
        items: [
          { weight: 10, value: 60 },
          { weight: 20, value: 100 },
          { weight: 30, value: 120 },
        ],
        capacity: 50,
      }),
    ].at(-1)!.state.result,
  ).toMatchObject({ value: 240, usedWeight: 50 });
});
it('backtracking enumerates N-Queens, distinct subsets and permutations with legal boards', () => {
  for (const [n, count] of [
    [1, 1],
    [2, 0],
    [4, 2],
    [8, 92],
  ]) {
    const r = [...backtracking.generate({ mode: 'queens', n })].at(-1)!.state
      .result as { count: number; solutions: number[][] };
    expect(r.count).toBe(count);
    for (const solution of r.solutions) {
      expect(new Set(solution).size).toBe(n);
      expect(new Set(solution.map((col, row) => row - col)).size).toBe(n);
      expect(new Set(solution.map((col, row) => row + col)).size).toBe(n);
    }
  }
  expect(
    [...backtracking.generate({ mode: 'subsets', values: [1, 2, 3] })].at(-1)!
      .state.result,
  ).toMatchObject({ count: 8 });
  expect(
    [...backtracking.generate({ mode: 'permutations', values: [1, 2, 3] })].at(
      -1,
    )!.state.result,
  ).toMatchObject({ count: 6 });
});
it('Sudoku solves a legal near-complete board and rejects conflicting givens', () => {
  const board = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];
  const input = board.map((row) => [...row]);
  input[0][0] = 0;
  const r = [...backtracking.generate({ mode: 'sudoku', board: input })].at(-1)!
    .state.result as { solutions: number[][]; budgetExceeded: boolean };
  expect(r.solutions).toEqual([board.flat()]);
  expect(r.budgetExceeded).toBe(false);
  input[0][0] = 3;
  expect(() =>
    backtracking.validateInput({ mode: 'sudoku', board: input }),
  ).toThrow();
});
