import 'server-only';
import { z } from 'zod';
import type { Visualizer, Frame, VisualState } from '@/engine/types';
import {
  frame,
  counters,
  randomNumbers,
  validateNumbers,
  arrayPresets,
} from '@/engine/helpers';
const costSchema = z.array(z.number().int().min(0).max(999)).min(1).max(64);
export const introduction: Visualizer<number[]> = {
  id: 'dynamic-programming-intro',
  presets: arrayPresets(),
  validateInput: (raw) => costSchema.parse(raw),
  inputHint:
    'Enter nonnegative stair costs, e.g. [10,15,20]. Start before the first stair; pay a stair cost when landing and reach the virtual top at index n with steps of one or two.',
  complexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(n) trace table; O(1) rolling-value alternative',
    why: 'Define dp[i] as the least cost to reach stair i. Optimal substructure gives cost[i]+min(dp[i−1],dp[i−2]); each overlapping subproblem is stored once.',
  },
  *generate(costs) {
    const c = counters(),
      dp: number[] = [];
    function emit(
      text: string,
      line: number,
      i = -1,
      action?: Frame['action'],
    ) {
      return frame(
        {
          kind: 'matrix',
          values: costs,
          rows: [costs, dp],
          labels: ['cost', 'dp'],
        },
        text,
        c,
        line,
        { index: i },
        i >= 0 ? [{ id: `1,${i}`, kind: 'comparing' }] : [],
        action,
      );
    }
    yield emit(
      'State a subproblem before choosing its recurrence or storage order.',
      1,
    );
    for (let i = 0; i <= costs.length; i++) {
      const one = i === 0 ? 0 : dp[i - 1],
        two = i < 2 ? 0 : dp[i - 2],
        landing = i === costs.length ? 0 : costs[i];
      yield emit(
        'Choose the cheaper predecessor, then add this landing cost.',
        3,
        i,
        {
          prompt: 'What is this subproblem’s minimum cost?',
          choices: [
            String(Math.min(one, two) + landing),
            String(Math.min(one, two) + landing + 1),
          ],
          answer: String(Math.min(one, two) + landing),
          hint: 'Use the cheaper of the one-step and two-step predecessors. The virtual top has no cost.',
        },
      );
      dp.push(Math.min(one, two) + landing);
      c.reads += 2;
      c.comparisons++;
      c.writes++;
      yield emit(
        'Store the subproblem so future states do not recompute it.',
        5,
        i,
      );
    }
    const f = emit('The virtual top state is the minimum total cost.', 6);
    f.state.result = { cost: dp.at(-1)!, dp };
    yield f;
  },
};
export function fibonacci(memo = false): Visualizer<number> {
  return {
    id: 'fibonacci-dp',
    maxSize: 64,
    presets: {
      best: 0,
      average: 8,
      worst: 40,
      random: (n) => Math.min(64, Math.max(0, Math.floor(n))),
    },
    validateInput: (raw) => z.number().int().min(0).max(64).parse(raw),
    inputHint:
      'Enter n from 0 to 64. Fibonacci values are exact decimal strings; F(0)=0 and F(1)=1.',
    complexity: {
      best: 'O(1) for a base case',
      average: 'O(n) arithmetic additions',
      worst: 'O(n) arithmetic additions',
      space: memo
        ? 'O(n) memo table and recursion stack'
        : 'O(n) displayed table; O(1) rolling-value alternative',
      why: 'Each distinct index is computed at most once. Big-integer operand sizes grow with n, so the arithmetic-operation count is separate from bit complexity.',
    },
    *generate(n) {
      const c = counters(),
        cache = new Map<number, bigint>([
          [0, 0n],
          [1, 1n],
        ]),
        calls: number[] = [];
      function emit(
        text: string,
        line: number,
        i: number,
        action?: Frame['action'],
      ) {
        return {
          ...frame(
            {
              kind: 'boxes',
              values: Array.from({ length: n + 1 }, (_, j) =>
                cache.has(j) ? 1 : 0,
              ),
              labels: Array.from(
                { length: n + 1 },
                (_, j) => cache.get(j)?.toString() ?? '∅',
              ),
            },
            text,
            c,
            line,
            { index: i },
            [{ id: String(i), kind: 'comparing' }],
            action,
          ),
          callStack: calls.map((v) => `fib(${v})`),
        };
      }
      yield emit(
        'Store exact base values before expanding any recurrence.',
        1,
        0,
      );
      if (memo) {
        function* fib(i: number): Generator<Frame, bigint> {
          c.reads++;
          if (cache.has(i)) {
            yield emit('Reuse this memoized subproblem.', 3, i);
            return cache.get(i)!;
          }
          calls.push(i);
          const a = yield* fib(i - 1),
            b = yield* fib(i - 2);
          cache.set(i, a + b);
          c.writes++;
          c.additions = (c.additions ?? 0) + 1;
          yield emit(
            'Store the sum after both dependencies have returned.',
            5,
            i,
          );
          calls.pop();
          return a + b;
        }
        yield* fib(n);
      } else
        for (let i = 2; i <= n; i++) {
          const sum = cache.get(i - 1)! + cache.get(i - 2)!;
          yield emit(
            'The next Fibonacci state adds its two predecessors.',
            3,
            i,
            {
              prompt: 'How many predecessor states are needed?',
              choices: ['Two', 'All previous states'],
              answer: 'Two',
              hint: 'F(i)=F(i−1)+F(i−2).',
            },
          );
          cache.set(i, sum);
          c.reads += 2;
          c.writes++;
          c.additions = (c.additions ?? 0) + 1;
          yield emit(
            'Tabulation computes dependencies before their users.',
            5,
            i,
          );
        }
      const f = emit('Every computed index was stored once.', 6, n);
      f.state.result = {
        value: cache.get(n)!.toString(),
        computed: [...cache.keys()].filter((i) => i <= n).sort((a, b) => a - b),
      };
      yield f;
    },
  };
}
const coinSchema = z.object({
  coins: z.array(z.number().int().min(1).max(99)).min(1).max(16),
  amount: z.number().int().min(0).max(64),
  mode: z.enum(['minimum', 'combinations']).default('minimum'),
});
export const coinChange: Visualizer<z.infer<typeof coinSchema>> = {
  id: 'coin-change',
  maxSize: 64,
  inputHint:
    'Enter {"coins":[1,3,4],"amount":6,"mode":"minimum"}. Mode combinations counts unordered ways; denominations have unlimited supply.',
  presets: {
    best: { coins: [1], amount: 0, mode: 'minimum' },
    average: { coins: [1, 3, 4], amount: 6, mode: 'minimum' },
    worst: { coins: [2, 4], amount: 31, mode: 'minimum' },
    random: (n) => ({
      coins: [1, 3, 4],
      amount: Math.min(64, n),
      mode: 'combinations',
    }),
  },
  validateInput: (raw) => coinSchema.parse(raw),
  complexity: {
    best: 'O(kA)',
    average: 'O(kA)',
    worst: 'O(kA)',
    space: 'O(A)',
    why: 'Minimum coin count uses a minimum over valid predecessor amounts. Unordered combination counting instead iterates denominations outside amounts, so each multiset is counted once.',
  },
  *generate({ coins: raw, amount, mode }) {
    const coins = [...new Set(raw)].sort((a, b) => a - b),
      c = counters(),
      dp = Array(amount + 1).fill(
        mode === 'minimum' ? Infinity : 0,
      ) as number[],
      chosen = Array(amount + 1).fill(-1) as number[];
    dp[0] = mode === 'minimum' ? 0 : 1;
    const emit = (
      text: string,
      line: number,
      a = 0,
      coin = 0,
      action?: Frame['action'],
    ) =>
      frame(
        {
          kind: 'boxes',
          values: dp.map((v) => (Number.isFinite(v) ? v : 0)),
          labels: dp.map((v) => (Number.isFinite(v) ? String(v) : '∞')),
        },
        text,
        c,
        line,
        { amount: a, coin, mode },
        [{ id: String(a), kind: 'comparing' }],
        action,
      );
    yield emit(
      'The zero-amount base is zero coins or one empty combination.',
      1,
    );
    if (mode === 'minimum') {
      for (let a = 1; a <= amount; a++)
        for (const coin of coins) {
          if (coin > a) continue;
          c.reads++;
          c.comparisons++;
          const candidate = dp[a - coin] + 1;
          yield emit(
            'Compare one chosen coin plus its predecessor amount.',
            3,
            a,
            coin,
            {
              prompt: 'Does this predecessor improve the minimum?',
              choices: ['Improve', 'Keep'],
              answer: candidate < dp[a] ? 'Improve' : 'Keep',
              hint: 'An unreachable predecessor cannot improve a finite result.',
            },
          );
          if (candidate < dp[a]) {
            dp[a] = candidate;
            chosen[a] = coin;
            c.writes++;
            yield emit(
              'Keep the best coin and its resulting count.',
              5,
              a,
              coin,
            );
          }
        }
    } else
      for (const coin of coins)
        for (let a = coin; a <= amount; a++) {
          dp[a] += dp[a - coin];
          c.reads += 2;
          c.writes++;
          yield emit(
            'Add ways that use this denomination after earlier denominations.',
            3,
            a,
            coin,
          );
        }
    const used: number[] = [];
    if (mode === 'minimum' && Number.isFinite(dp[amount]))
      for (let at = amount; at > 0; at -= chosen[at]) used.push(chosen[at]);
    const f = emit(
      'The final state answers the selected coin-change question.',
      6,
      amount,
    );
    f.state.result =
      mode === 'minimum'
        ? {
            minimum: Number.isFinite(dp[amount]) ? dp[amount] : null,
            coins: used,
          }
        : { combinations: dp[amount] };
    yield f;
  },
};
const knapsackSchema = z.object({
  weights: z.array(z.number().int().min(1).max(32)).min(1).max(16),
  values: z.array(z.number().int().min(0).max(999)).min(1).max(16),
  capacity: z.number().int().min(0).max(64),
});
export const knapsack: Visualizer<z.infer<typeof knapsackSchema>> = {
  id: '0-1-knapsack',
  maxSize: 16,
  inputHint:
    'Enter {"weights":[2,3,4],"values":[4,5,7],"capacity":5}. Each item may be taken at most once.',
  presets: {
    best: { weights: [1], values: [5], capacity: 0 },
    average: { weights: [2, 3, 4], values: [4, 5, 7], capacity: 5 },
    worst: {
      weights: [1, 2, 3, 4, 5, 6],
      values: [2, 4, 4, 6, 7, 9],
      capacity: 12,
    },
    random: (n) => ({
      weights: Array.from({ length: Math.min(16, n) }, (_, i) => (i % 5) + 1),
      values: randomNumbers(Math.min(16, n)),
      capacity: Math.min(64, n * 2),
    }),
  },
  validateInput(raw) {
    const p = knapsackSchema.parse(raw);
    if (p.weights.length !== p.values.length)
      throw new Error('Weights and values must have equal length.');
    return p;
  },
  complexity: {
    best: 'O(nW)',
    average: 'O(nW)',
    worst: 'O(nW) pseudo-polynomial',
    space: 'O(nW) table; O(W) value-only optimization',
    why: 'The state includes item count and integer remaining capacity. Both taking and skipping read only the previous item row, preventing the same item from being reused.',
  },
  *generate({ weights, values, capacity }) {
    const c = counters(),
      dp = Array.from(
        { length: weights.length + 1 },
        () => Array(capacity + 1).fill(0) as number[],
      );
    const emit = (
      text: string,
      line: number,
      i = 0,
      w = 0,
      action?: Frame['action'],
    ) =>
      frame(
        { kind: 'matrix', values: [], rows: dp },
        text,
        c,
        line,
        { items: i, capacity: w },
        [{ id: `${i},${w}`, kind: 'comparing' }],
        action,
      );
    yield emit('Zero items or zero capacity give zero selected value.', 1);
    for (let i = 1; i <= weights.length; i++)
      for (let w = 0; w <= capacity; w++) {
        const skip = dp[i - 1][w],
          take =
            weights[i - 1] <= w
              ? values[i - 1] + dp[i - 1][w - weights[i - 1]]
              : -1;
        c.reads += 2;
        c.comparisons++;
        yield emit(
          'Choose between skipping this item and taking it once.',
          3,
          i,
          w,
          {
            prompt: 'Which choice gives this state its best value?',
            choices: ['Take', 'Skip or tie'],
            answer: take > skip ? 'Take' : 'Skip or tie',
            hint: 'Taking consumes this item and reads the previous item row at lower capacity.',
          },
        );
        dp[i][w] = Math.max(skip, take);
        c.writes++;
      }
    const selected: number[] = [];
    let w = capacity;
    for (let i = weights.length; i > 0; i--)
      if (dp[i][w] !== dp[i - 1][w]) {
        selected.push(i - 1);
        w -= weights[i - 1];
      }
    selected.reverse();
    const f = emit(
      'Trace changed rows backward to recover one optimal item set.',
      6,
      weights.length,
      capacity,
    );
    f.state.result = {
      value: dp[weights.length][capacity],
      items: selected,
      totalWeight: selected.reduce((sum, i) => sum + weights[i], 0),
    };
    yield f;
  },
};
const pairSchema = z.object({
  a: z
    .string()
    .max(24)
    .regex(/^[\x20-\x7e]*$/),
  b: z
    .string()
    .max(24)
    .regex(/^[\x20-\x7e]*$/),
});
export function sequencePair(
  edit = false,
): Visualizer<z.infer<typeof pairSchema>> {
  return {
    id: edit ? 'edit-distance' : 'longest-common-subsequence',
    maxSize: 24,
    inputHint:
      'Enter {"a":"abcde","b":"ace"}. Printable ASCII; empty strings are valid. Edit distance uses insertion/deletion/substitution cost one.',
    presets: {
      best: { a: '', b: '' },
      average: edit ? { a: 'kitten', b: 'sitting' } : { a: 'abcde', b: 'ace' },
      worst: { a: 'aaaaaaaaaaaa', b: 'bbbbbbbbbbbb' },
      random: (n, s = 42) => ({
        a: randomNumbers(Math.min(n, 24), s)
          .map((v) => String.fromCharCode(97 + (v % 4)))
          .join(''),
        b: randomNumbers(Math.min(n, 24), s + 1)
          .map((v) => String.fromCharCode(97 + (v % 4)))
          .join(''),
      }),
    },
    validateInput: (raw) => pairSchema.parse(raw),
    complexity: {
      best: 'O(mn)',
      average: 'O(mn)',
      worst: 'O(mn)',
      space: 'O(mn) reconstruction table',
      why: edit
        ? 'Each prefix pair chooses a matching diagonal or the cheapest insertion, deletion or substitution. Boundary rows encode transformation to or from an empty prefix.'
        : 'A matching character extends the previous diagonal subsequence; otherwise one final character must be skipped. Subsequence characters retain order but need not be contiguous.',
    },
    *generate({ a, b }) {
      const c = counters(),
        dp = Array.from({ length: a.length + 1 }, (_, i) =>
          Array.from({ length: b.length + 1 }, (_, j) =>
            edit ? (i === 0 ? j : j === 0 ? i : 0) : 0,
          ),
        );
      const emit = (
        text: string,
        line: number,
        i = 0,
        j = 0,
        action?: Frame['action'],
      ) =>
        frame(
          { kind: 'matrix', values: [], rows: dp },
          text,
          c,
          line,
          { a, b, i, j },
          [{ id: `${i},${j}`, kind: 'comparing' }],
          action,
        );
      yield emit('The table indexes prefixes, including each empty prefix.', 1);
      for (let i = 1; i <= a.length; i++)
        for (let j = 1; j <= b.length; j++) {
          const equal = a[i - 1] === b[j - 1];
          c.comparisons++;
          c.reads += 3;
          yield emit(
            'Compare the final characters of these two prefixes.',
            3,
            i,
            j,
            {
              prompt: 'Do these prefix-ending characters match?',
              choices: ['Match', 'Mismatch'],
              answer: equal ? 'Match' : 'Mismatch',
              hint: 'Inspect a[i−1] and b[j−1], not the prefix lengths.',
            },
          );
          dp[i][j] = edit
            ? equal
              ? dp[i - 1][j - 1]
              : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
            : equal
              ? dp[i - 1][j - 1] + 1
              : Math.max(dp[i - 1][j], dp[i][j - 1]);
          c.writes++;
        }
      let i = a.length,
        j = b.length;
      const subsequence: string[] = [],
        operations: { operation: string; from: string; to: string }[] = [];
      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
          subsequence.push(a[i - 1]);
          i--;
          j--;
        } else if (edit) {
          if (i > 0 && j > 0 && dp[i][j] === 1 + dp[i - 1][j - 1]) {
            operations.push({ operation: 'replace', from: a[--i], to: b[--j] });
          } else if (i > 0 && dp[i][j] === 1 + dp[i - 1][j])
            operations.push({ operation: 'delete', from: a[--i], to: '' });
          else operations.push({ operation: 'insert', from: '', to: b[--j] });
        } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) i--;
        else j--;
      }
      const f = emit(
        'Backtracking through optimal predecessor states recovers one answer.',
        6,
        a.length,
        b.length,
      );
      f.state.result = edit
        ? { distance: dp[a.length][b.length], operations: operations.reverse() }
        : {
            length: dp[a.length][b.length],
            subsequence: subsequence.reverse().join(''),
          };
      yield f;
    },
  };
}

export const lis: Visualizer<number[]> = {
  id: 'longest-increasing-subsequence',
  presets: arrayPresets(),
  validateInput: validateNumbers,
  inputHint:
    'Enter 1–64 integers. Strictly increasing subsequences do not extend on equal values.',
  complexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
    why: 'Binary search finds the first tail at least as large as the incoming key. Replacing that tail preserves a minimal possible ending value for every subsequence length; predecessor indices recover one actual subsequence.',
  },
  *generate(input) {
    const c = counters(),
      tails: number[] = [],
      tailIndices: number[] = [],
      previous = Array(input.length).fill(-1) as number[];
    function emit(
      text: string,
      line: number,
      i = -1,
      action?: Frame['action'],
    ) {
      return frame(
        {
          kind: 'matrix',
          values: input,
          rows: [input, tails],
          labels: ['input', 'minimum tails'],
        },
        text,
        c,
        line,
        { index: i, tails: tails.join(', ') },
        i >= 0 ? [{ id: `0,${i}`, kind: 'comparing' }] : [],
        action,
      );
    }
    yield emit(
      'Tails summarize possibilities; the tails array itself is not necessarily the recovered subsequence.',
      1,
    );
    for (let i = 0; i < input.length; i++) {
      let left = 0,
        right = tails.length;
      while (left < right) {
        const mid = left + Math.floor((right - left) / 2);
        c.comparisons++;
        c.reads++;
        yield emit(
          'Find the first tail that is not smaller than the incoming key.',
          3,
          i,
          {
            prompt: 'Is this middle tail strictly smaller?',
            choices: ['Search right', 'Search left including middle'],
            answer:
              tails[mid] < input[i]
                ? 'Search right'
                : 'Search left including middle',
            hint: 'This lower-bound search enforces strict increase; an equal key replaces rather than extends.',
          },
        );
        if (tails[mid] < input[i]) left = mid + 1;
        else right = mid;
      }
      previous[i] = left > 0 ? tailIndices[left - 1] : -1;
      tails[left] = input[i];
      tailIndices[left] = i;
      c.writes += 3;
      yield emit(
        'Keep the smallest ending value for this length and remember its predecessor.',
        5,
        i,
      );
    }
    const indices: number[] = [];
    for (let at = tailIndices.at(-1)!; at !== -1; at = previous[at])
      indices.push(at);
    indices.reverse();
    const f = emit(
      'The predecessor chain recovers an increasing subsequence of optimal length.',
      6,
    );
    f.state.result = {
      length: tails.length,
      indices,
      subsequence: indices.map((i) => input[i]),
    };
    yield f;
  },
};
const chainSchema = z.array(z.number().int().min(1).max(99)).min(2).max(12);
export const matrixChain: Visualizer<number[]> = {
  id: 'matrix-chain-multiplication',
  maxSize: 12,
  inputHint:
    'Enter dimensions [10,30,5,60], representing A1=10×30, A2=30×5, A3=5×60. Matrix order stays fixed; only parentheses change.',
  presets: {
    best: [10, 20],
    average: [10, 30, 5, 60],
    worst: [30, 35, 15, 5, 10, 20, 25],
    random: (n, s) => randomNumbers(Math.min(12, Math.max(2, n)), s),
  },
  validateInput: (raw) => chainSchema.parse(raw),
  complexity: {
    best: 'O(n³)',
    average: 'O(n³)',
    worst: 'O(n³)',
    space: 'O(n²)',
    why: 'There are O(n²) matrix intervals and O(n) possible final split positions per interval. A split combines two already-optimized subchains plus dimensions[i]·dimensions[k+1]·dimensions[j+1] scalar multiplications.',
  },
  *generate(dims) {
    const n = dims.length - 1,
      c = counters(),
      dp = Array.from({ length: n }, () => Array(n).fill(0) as number[]),
      split = Array.from({ length: n }, () => Array(n).fill(-1) as number[]);
    const emit = (
      text: string,
      line: number,
      i = 0,
      j = 0,
      vars: Frame['variables'] = {},
      action?: Frame['action'],
    ) =>
      frame(
        { kind: 'matrix', values: dims, rows: dp },
        text,
        c,
        line,
        { i, j, ...vars },
        [{ id: `${i},${j}`, kind: 'comparing' }],
        action,
      );
    yield emit('A single matrix needs no scalar multiplications.', 1);
    for (let length = 2; length <= n; length++)
      for (let i = 0; i + length <= n; i++) {
        const j = i + length - 1;
        let best = Infinity;
        for (let k = i; k < j; k++) {
          const cost =
            dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1];
          c.reads += 2;
          c.comparisons++;
          yield emit(
            'Try this final split of the matrix interval.',
            3,
            i,
            j,
            {
              split: k,
              candidate: cost,
              best: Number.isFinite(best) ? best : null,
            },
            {
              prompt: 'Does this split improve the best known cost?',
              choices: ['Improve', 'Keep current split'],
              answer: cost < best ? 'Improve' : 'Keep current split',
              hint: 'Add both subchain costs and the scalar cost of multiplying their resulting matrix shapes.',
            },
          );
          if (cost < best) {
            best = cost;
            split[i][j] = k;
          }
        }
        dp[i][j] = best;
        c.writes++;
        yield emit(
          'Store the least-cost parenthesization for this interval.',
          5,
          i,
          j,
        );
      }
    function expression(i: number, j: number): string {
      if (i === j) return `A${i + 1}`;
      const k = split[i][j];
      return `(${expression(i, k)}×${expression(k + 1, j)})`;
    }
    const f = emit(
      'The optimal parentheses preserve the original matrix order.',
      6,
      0,
      n - 1,
    );
    f.state.result = {
      cost: dp[0][n - 1],
      parenthesization: expression(0, n - 1),
      split,
    };
    yield f;
  },
};
const gridSchema = z.object({
  cells: z
    .array(z.array(z.number().int().min(-99).max(99).nullable()).min(1).max(10))
    .min(1)
    .max(10),
  mode: z.enum(['paths', 'minimum-cost']).default('paths'),
});
export const gridDp: Visualizer<z.infer<typeof gridSchema>> = {
  id: 'dp-on-grids',
  maxSize: 10,
  inputHint:
    'Enter {"cells":[[1,1,1],[1,null,1],[1,1,1]],"mode":"paths"}. Null blocks a cell. Move only right/down. minimum-cost includes each visited cell cost.',
  presets: {
    best: { cells: [[1]], mode: 'paths' },
    average: {
      cells: [
        [1, 1, 1],
        [1, null, 1],
        [1, 1, 1],
      ],
      mode: 'paths',
    },
    worst: {
      cells: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      mode: 'minimum-cost',
    },
    random: (n) => {
      const side = Math.min(10, Math.max(1, Math.floor(Math.sqrt(n))));
      return {
        cells: Array.from(
          { length: side },
          () => Array(side).fill(1) as number[],
        ),
        mode: 'paths',
      };
    },
  },
  validateInput(raw) {
    const p = gridSchema.parse(raw);
    if (p.cells.some((row) => row.length !== p.cells[0].length))
      throw new Error('Use a rectangular grid with equal row lengths.');
    return p;
  },
  complexity: {
    best: 'O(RC)',
    average: 'O(RC)',
    worst: 'O(RC)',
    space: 'O(RC) displayed/reconstruction table',
    why: 'Right/down movement makes a DAG. Every cell combines only its top and left predecessors, so row-major order computes dependencies first; blocked cells contribute no valid path.',
  },
  *generate({ cells, mode }) {
    const rows = cells.length,
      cols = cells[0].length,
      c = counters(),
      dp = Array.from(
        { length: rows },
        () => Array(cols).fill(mode === 'paths' ? 0 : Infinity) as number[],
      );
    function emit(
      text: string,
      line: number,
      r = 0,
      col = 0,
      action?: Frame['action'],
    ) {
      return frame(
        {
          kind: 'matrix',
          values: [],
          rows: dp.map((row) => row.map((v) => (Number.isFinite(v) ? v : 0))),
          cellLabels: dp.map((row, i) =>
            row.map((v, j) =>
              cells[i][j] === null ? '×' : Number.isFinite(v) ? String(v) : '∞',
            ),
          ),
        },
        text,
        c,
        line,
        { row: r, column: col, mode },
        [{ id: `${r},${col}`, kind: 'comparing' }],
        action,
      );
    }
    yield emit('Only top and left predecessors can reach a cell.', 1);
    for (let r = 0; r < rows; r++)
      for (let col = 0; col < cols; col++) {
        if (cells[r][col] === null) continue;
        if (r === 0 && col === 0)
          dp[r][col] = mode === 'paths' ? 1 : cells[0][0]!;
        else {
          const above =
              r > 0 ? dp[r - 1][col] : mode === 'paths' ? 0 : Infinity,
            left = col > 0 ? dp[r][col - 1] : mode === 'paths' ? 0 : Infinity;
          yield emit('Combine the valid predecessor states.', 3, r, col, {
            prompt: 'Which predecessors can reach this cell?',
            choices: ['Top and left', 'Bottom and right'],
            answer: 'Top and left',
            hint: 'The allowed moves are right and down, so predecessors are above and to the left.',
          });
          dp[r][col] =
            mode === 'paths'
              ? above + left
              : Math.min(above, left) + cells[r][col]!;
          c.reads += 2;
          c.comparisons++;
        }
        c.writes++;
        yield emit('Store this cell’s answer once.', 5, r, col);
      }
    const path: number[][] = [];
    let r = rows - 1,
      col = cols - 1;
    const reachable =
      cells[r][col] !== null &&
      (mode === 'paths' ? dp[r][col] > 0 : Number.isFinite(dp[r][col]));
    if (mode === 'minimum-cost' && reachable) {
      while (true) {
        path.push([r, col]);
        if (r === 0 && col === 0) break;
        const above = r > 0 ? dp[r - 1][col] : Infinity,
          left = col > 0 ? dp[r][col - 1] : Infinity;
        if (above <= left) r--;
        else col--;
      }
      path.reverse();
    }
    const f = emit(
      'The bottom-right state answers the selected grid question.',
      6,
      rows - 1,
      cols - 1,
    );
    f.state.result = {
      value: reachable ? dp[rows - 1][cols - 1] : mode === 'paths' ? 0 : null,
      path,
    };
    yield f;
  },
};
const treeDpSchema = z.object({
  parents: z.array(z.number().int().min(-1).max(31)).min(1).max(32),
  weights: z.array(z.number().int().min(0).max(999)).min(1).max(32),
});
export const treeDp: Visualizer<z.infer<typeof treeDpSchema>> = {
  id: 'dp-on-trees',
  maxSize: 32,
  inputHint:
    'Enter {"parents":[-1,0,0,1,1],"weights":[4,5,6,2,3]}. Choose a maximum-weight set with no adjacent tree vertices. Every parent precedes its child.',
  presets: {
    best: { parents: [-1], weights: [5] },
    average: { parents: [-1, 0, 0, 1, 1], weights: [4, 5, 6, 2, 3] },
    worst: { parents: [-1, 0, 1, 2, 3, 4], weights: [1, 2, 3, 4, 5, 6] },
    random: (n, s) => {
      const weights = randomNumbers(Math.min(n, 32), s);
      return {
        weights,
        parents: weights.map((_, i) =>
          i === 0 ? -1 : Math.floor((i - 1) / 2),
        ),
      };
    },
  },
  validateInput(raw) {
    const p = treeDpSchema.parse(raw);
    if (
      p.parents.length !== p.weights.length ||
      p.parents[0] !== -1 ||
      p.parents.some((parent, i) => i > 0 && (parent < 0 || parent >= i))
    )
      throw new Error(
        'Use equal arrays, root parent -1, and smaller valid parent indices for every child.',
      );
    return p;
  },
  complexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(n)',
    why: 'A node has two states: included or excluded. Included forces all children excluded; excluded independently chooses each child’s better state. Postorder guarantees child answers are available.',
  },
  *generate({ parents, weights }) {
    const c = counters(),
      children = parents.map(() => [] as number[]),
      depth = parents.map(() => 0),
      dp = parents.map(() => [0, 0]);
    for (let i = 1; i < parents.length; i++) {
      children[parents[i]].push(i);
      depth[i] = depth[parents[i]] + 1;
    }
    const state: VisualState = {
      kind: 'tree',
      values: weights,
      nodes: parents.map((_, i) => ({
        id: String(i),
        label: `${i}:${weights[i]}`,
        x: 35 + 55 * i,
        y: 40 + depth[i] * 65,
      })),
      edges: parents.flatMap((p, i) =>
        i ? [{ from: String(p), to: String(i) }] : [],
      ),
    };
    const emit = (
      text: string,
      line: number,
      u = 0,
      action?: Frame['action'],
    ) =>
      frame(
        state,
        text,
        c,
        line,
        { vertex: u, exclude: dp[u][0], include: dp[u][1] },
        [{ id: String(u), kind: 'comparing' }],
        action,
      );
    yield emit(
      'Each subtree stores the best answer with its root excluded and included.',
      1,
    );
    for (let u = parents.length - 1; u >= 0; u--) {
      dp[u][1] = weights[u];
      for (const v of children[u]) {
        dp[u][1] += dp[v][0];
        dp[u][0] += Math.max(dp[v][0], dp[v][1]);
        c.reads += 3;
        c.comparisons++;
        c.writes += 2;
      }
      yield emit(
        'An included parent forbids every child from being included.',
        3,
        u,
        {
          prompt: 'Which child state can an included parent use?',
          choices: ['Excluded child', 'Included child'],
          answer: 'Excluded child',
          hint: 'Adjacent vertices cannot both belong to the selected independent set.',
        },
      );
      yield emit('Store both subtree states before visiting the parent.', 5, u);
    }
    const selected: number[] = [];
    function recover(u: number, parentIncluded: boolean) {
      const include = !parentIncluded && dp[u][1] > dp[u][0];
      if (include) selected.push(u);
      for (const child of children[u]) recover(child, include);
    }
    recover(0, false);
    const f = emit(
      'Choose the better root state and recover a compatible independent set.',
      6,
    );
    f.state.result = { value: Math.max(...dp[0]), selected, dp };
    yield f;
  },
};
export const divideConquer: Visualizer<number[]> = {
  id: 'divide-conquer',
  presets: arrayPresets(),
  validateInput: validateNumbers,
  inputHint:
    'Enter integers to find a maximum-sum nonempty contiguous subarray using divide-and-conquer. Negative-only arrays return their least-negative element.',
  complexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(log n) recursion stack',
    why: 'Solve left and right halves, then scan a maximum suffix of the left half and a maximum prefix of the right half. The best interval is left-only, right-only or crossing the split.',
  },
  *generate(input) {
    type Answer = { sum: number; start: number; end: number };
    const c = counters(),
      calls: string[] = [];
    function emit(
      text: string,
      line: number,
      vars: Frame['variables'] = {},
      action?: Frame['action'],
    ) {
      return {
        ...frame(
          { kind: 'array', values: input },
          text,
          c,
          line,
          vars,
          [],
          action,
        ),
        callStack: [...calls],
      };
    }
    yield emit(
      'Every nonempty interval is solved by splitting, solving and combining.',
      1,
    );
    function* solve(lo: number, hi: number): Generator<Frame, Answer> {
      calls.push(`[${lo},${hi})`);
      if (hi - lo === 1) {
        c.reads++;
        yield emit('A one-element interval is its own nonempty answer.', 2, {
          lo,
          hi,
          sum: input[lo],
        });
        calls.pop();
        return { sum: input[lo], start: lo, end: hi };
      }
      const mid = lo + Math.floor((hi - lo) / 2);
      const left = yield* solve(lo, mid),
        right = yield* solve(mid, hi);
      let sum = 0,
        leftSum = -Infinity,
        rightSum = -Infinity,
        start = mid - 1,
        end = mid + 1;
      for (let i = mid - 1; i >= lo; i--) {
        sum += input[i];
        c.reads++;
        c.comparisons++;
        if (sum > leftSum) {
          leftSum = sum;
          start = i;
        }
        yield emit(
          'Find the best suffix that touches the left side of the split.',
          3,
          { index: i, sum, best: leftSum },
        );
      }
      sum = 0;
      for (let i = mid; i < hi; i++) {
        sum += input[i];
        c.reads++;
        c.comparisons++;
        if (sum > rightSum) {
          rightSum = sum;
          end = i + 1;
        }
        yield emit(
          'Find the best prefix that touches the right side of the split.',
          3,
          { index: i, sum, best: rightSum },
        );
      }
      const cross = { sum: leftSum + rightSum, start, end };
      const best =
        left.sum >= right.sum && left.sum >= cross.sum
          ? left
          : right.sum >= cross.sum
            ? right
            : cross;
      c.comparisons += 2;
      yield emit(
        'Select the best left-only, right-only or crossing interval.',
        5,
        { left: left.sum, right: right.sum, cross: cross.sum, best: best.sum },
        {
          prompt: 'Must every optimal interval cross the split?',
          choices: ['No', 'Yes'],
          answer: 'No',
          hint: 'The optimum can lie entirely in either half or cross the boundary.',
        },
      );
      calls.pop();
      return best;
    }
    const result = yield* solve(0, input.length),
      f = emit(
        'The recovered half-open interval has maximum nonempty contiguous sum.',
        6,
      );
    f.state.result = {
      ...result,
      values: input.slice(result.start, result.end),
    };
    yield f;
  },
};
