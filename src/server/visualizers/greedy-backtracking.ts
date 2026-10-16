import 'server-only';
import { z } from 'zod';
import type { Visualizer, Frame } from '@/engine/types';
import { frame, counters, randomNumbers } from '@/engine/helpers';
const greedySchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('activities'),
    intervals: z
      .array(
        z.tuple([
          z.number().int().min(0).max(999),
          z.number().int().min(1).max(999),
        ]),
      )
      .min(1)
      .max(24),
  }),
  z.object({
    mode: z.literal('fractional-knapsack'),
    items: z
      .array(
        z.object({
          weight: z.number().int().min(1).max(99),
          value: z.number().int().min(0).max(999),
        }),
      )
      .min(1)
      .max(24),
    capacity: z.number().int().min(0).max(999),
  }),
]);
export const greedy: Visualizer<z.infer<typeof greedySchema>> = {
  id: 'greedy-algorithms',
  maxSize: 24,
  inputHint:
    'Use {"mode":"activities","intervals":[[1,3],[2,5],[3,4]]} or {"mode":"fractional-knapsack","items":[{"weight":10,"value":60},{"weight":20,"value":100}],"capacity":15}. Items are divisible only in fractional mode.',
  presets: {
    best: {
      mode: 'activities',
      intervals: [
        [0, 1],
        [1, 2],
        [2, 3],
      ],
    },
    average: {
      mode: 'activities',
      intervals: [
        [1, 4],
        [3, 5],
        [0, 6],
        [5, 7],
        [3, 9],
        [5, 9],
        [6, 10],
        [8, 11],
      ],
    },
    worst: {
      mode: 'fractional-knapsack',
      items: [
        { weight: 10, value: 60 },
        { weight: 20, value: 100 },
        { weight: 30, value: 120 },
      ],
      capacity: 50,
    },
    random: (n, s) => ({
      mode: 'fractional-knapsack',
      items: randomNumbers(Math.min(n, 24), s).map((v, i) => ({
        weight: (v % 10) + 1,
        value: v + i,
      })),
      capacity: n * 3,
    }),
  },
  validateInput(raw) {
    const p = greedySchema.parse(raw);
    if (
      p.mode === 'activities' &&
      p.intervals.some(([start, end]) => start >= end)
    )
      throw new Error('Every activity must end strictly after it starts.');
    return p;
  },
  complexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n) sorted/indexed teaching copy',
    why: 'An exchange argument justifies earliest finishing for maximum-count interval scheduling. Value density is optimal for divisible fractional knapsack, but does not solve 0/1 knapsack.',
  },
  *generate(input) {
    const c = counters();
    yield frame(
      { kind: 'boxes', values: [] },
      'A greedy rule needs a proof tied to the exact problem constraints.',
      c,
      1,
      { mode: input.mode },
    );
    if (input.mode === 'activities') {
      const sorted = input.intervals
          .map(([start, end], id) => ({ start, end, id }))
          .sort((a, b) => {
            c.comparisons++;
            return a.end - b.end || a.start - b.start || a.id - b.id;
          }),
        selected: number[] = [];
      let lastEnd = 0;
      for (const item of sorted) {
        const eligible = item.start >= lastEnd;
        c.comparisons++;
        c.reads++;
        yield frame(
          {
            kind: 'matrix',
            values: [],
            rows: sorted.map((a) => [a.start, a.end]),
            labels: sorted.map((a) => String(a.id)),
          },
          'Choose the earliest finishing activity compatible with the selected prefix.',
          c,
          3,
          { id: item.id, lastEnd, start: item.start, end: item.end },
          [{ id: `${sorted.indexOf(item)},0`, kind: 'comparing' }],
          {
            prompt: 'Can this activity join the chosen schedule?',
            choices: ['Take activity', 'Skip overlap'],
            answer: eligible ? 'Take activity' : 'Skip overlap',
            hint: 'Touching endpoints are allowed: start must be at least the last chosen end.',
          },
        );
        if (eligible) {
          selected.push(item.id);
          lastEnd = item.end;
          c.writes++;
        }
      }
      yield frame(
        {
          kind: 'boxes',
          values: selected,
          result: { selected, count: selected.length },
        },
        'Earliest finish leaves at least as much room for every later choice.',
        c,
        6,
        { count: selected.length },
      );
    } else {
      const sorted = input.items
          .map((item, id) => ({ ...item, id }))
          .sort((a, b) => {
            c.comparisons++;
            return b.value * a.weight - a.value * b.weight || a.id - b.id;
          }),
        taken: {
          id: number;
          fraction: number;
          weight: number;
          value: number;
        }[] = [];
      let remaining = input.capacity,
        value = 0;
      for (const item of sorted) {
        if (remaining <= 0) break;
        const fraction = Math.min(1, remaining / item.weight);
        yield frame(
          {
            kind: 'boxes',
            values: sorted.map((i) => i.value),
            labels: sorted.map((i) => `${i.id}: ${i.value}/${i.weight}`),
          },
          'Consume the best remaining value density, allowing the final item to be split.',
          c,
          3,
          { id: item.id, remaining, fraction },
          [{ id: String(sorted.indexOf(item)), kind: 'comparing' }],
          {
            prompt: 'May this problem take only part of an item?',
            choices: [
              'Yes, items are divisible',
              'No, each item is all-or-nothing',
            ],
            answer: 'Yes, items are divisible',
            hint: 'The fractional constraint is the reason density sorting is optimal.',
          },
        );
        const used = fraction * item.weight,
          gain = fraction * item.value;
        remaining = Math.max(0, remaining - used);
        value += gain;
        taken.push({ id: item.id, fraction, weight: used, value: gain });
        c.reads++;
        c.writes++;
      }
      yield frame(
        {
          kind: 'boxes',
          values: taken.map((i) => i.value),
          result: { value, taken, usedWeight: input.capacity - remaining },
        },
        'The greedy density rule applies to fractional knapsack, not the 0/1 variant.',
        c,
        6,
        { value, remaining },
      );
    }
  },
};
const boardSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('queens'), n: z.number().int().min(1).max(8) }),
  z.object({
    mode: z.literal('subsets'),
    values: z.array(z.number().int().min(-99).max(99)).max(10),
  }),
  z.object({
    mode: z.literal('permutations'),
    values: z.array(z.number().int().min(-99).max(99)).max(6),
  }),
  z.object({
    mode: z.literal('sudoku'),
    board: z.array(z.array(z.number().int().min(0).max(9)).length(9)).length(9),
  }),
]);
export const backtracking: Visualizer<z.infer<typeof boardSchema>> = {
  id: 'backtracking',
  maxSize: 8,
  inputHint:
    'Use {"mode":"queens","n":4}, {"mode":"subsets","values":[1,2,3]}, {"mode":"permutations","values":[1,2,3]}, or a 9×9 Sudoku board with 0 for blanks. Sudoku has a bounded search budget and reports when exhausted.',
  presets: {
    best: { mode: 'queens', n: 1 },
    average: { mode: 'queens', n: 4 },
    worst: { mode: 'queens', n: 8 },
    random: (n) => ({
      mode: 'queens',
      n: Math.min(8, Math.max(1, Math.floor(Math.log2(n + 1)))),
    }),
  },
  validateInput(raw) {
    const p = boardSchema.parse(raw);
    if (
      (p.mode === 'subsets' || p.mode === 'permutations') &&
      new Set(p.values).size !== p.values.length
    )
      throw new Error(
        'Use distinct values so each generated subset or permutation has one identity.',
      );
    if (p.mode === 'sudoku') {
      for (let r = 0; r < 9; r++)
        for (let col = 0; col < 9; col++) {
          const v = p.board[r][col];
          if (!v) continue;
          for (let i = 0; i < 9; i++)
            if (
              (i !== col && p.board[r][i] === v) ||
              (i !== r && p.board[i][col] === v)
            )
              throw new Error('Sudoku givens conflict in a row or column.');
          const top = Math.floor(r / 3) * 3,
            left = Math.floor(col / 3) * 3;
          for (let a = top; a < top + 3; a++)
            for (let b = left; b < left + 3; b++)
              if ((a !== r || b !== col) && p.board[a][b] === v)
                throw new Error('Sudoku givens conflict in a box.');
        }
    }
    return p;
  },
  complexity: {
    best: 'Search/output dependent',
    average: 'Constraint and pruning dependent',
    worst:
      'Queens O(n!·n) simple safety checks; subsets O(n·2ⁿ); permutations O(n·n!); Sudoku exponential in blanks',
    space: 'O(depth) search state plus stored output',
    why: 'Choose a candidate, test constraints, recurse, then undo that choice. Pruning avoids invalid branches, but enumeration must still pay for its output. A budget limit is not proof of unsatisfiability.',
  },
  *generate(input) {
    const c = counters(),
      solutions: number[][] = [];
    let visits = 0,
      budgetExceeded = false;
    function emit(
      text: string,
      line: number,
      state: number[][],
      vars: Frame['variables'] = {},
      action?: Frame['action'],
    ) {
      return frame(
        { kind: 'grid', values: [], rows: state },
        text,
        c,
        line,
        vars,
        [],
        action,
      );
    }
    yield emit(
      'Keep partial choices separate from committed solutions.',
      1,
      [],
    );
    if (input.mode === 'queens') {
      const queens: number[] = [],
        used = new Set<number>(),
        down = new Set<number>(),
        up = new Set<number>();
      function board() {
        return Array.from(
          { length: input.mode === 'queens' ? input.n : 0 },
          (_, r) =>
            Array.from(
              { length: input.mode === 'queens' ? input.n : 0 },
              (_, col) => (queens[r] === col ? 1 : 0),
            ),
        );
      }
      function* search(row: number): Generator<Frame> {
        if (input.mode !== 'queens') return;
        if (row === input.n) {
          solutions.push([...queens]);
          c.writes++;
          yield emit(
            'Every row now contains one nonattacking queen.',
            5,
            board(),
            { solution: solutions.length },
          );
          return;
        }
        for (let col = 0; col < input.n; col++) {
          c.comparisons++;
          if (used.has(col) || down.has(row - col) || up.has(row + col))
            continue;
          queens.push(col);
          used.add(col);
          down.add(row - col);
          up.add(row + col);
          c.writes++;
          yield emit(
            'Choose a column whose column and diagonals are unoccupied.',
            3,
            board(),
            { row, column: col },
            {
              prompt: 'Must this choice be undone after exploring its branch?',
              choices: [
                'Undo before the next sibling',
                'Keep it for every later sibling',
              ],
              answer: 'Undo before the next sibling',
              hint: 'A sibling branch must start from the same parent state.',
            },
          );
          yield* search(row + 1);
          queens.pop();
          used.delete(col);
          down.delete(row - col);
          up.delete(row + col);
          c.writes++;
        }
      }
      yield* search(0);
    } else if (input.mode === 'subsets' || input.mode === 'permutations') {
      const { values, mode } = input,
        path: number[] = [],
        used = Array(values.length).fill(false) as boolean[];
      function* search(index: number): Generator<Frame> {
        visits++;
        if (mode === 'subsets') {
          if (index === values.length) {
            solutions.push([...path]);
            yield emit('Record this include/exclude assignment.', 5, [path], {
              solutions: solutions.length,
            });
            return;
          }
          yield emit(
            'Branch once without this value, then once with it.',
            3,
            [path],
            { index },
          );
          yield* search(index + 1);
          path.push(values[index]);
          yield* search(index + 1);
          path.pop();
        } else if (path.length === values.length) {
          solutions.push([...path]);
          yield emit('Record a complete permutation.', 5, [path], {
            solutions: solutions.length,
          });
        } else
          for (let i = 0; i < values.length; i++)
            if (!used[i]) {
              used[i] = true;
              path.push(values[i]);
              yield emit(
                'Choose an unused value for the next position.',
                3,
                [path],
                { index: i },
              );
              yield* search(index + 1);
              path.pop();
              used[i] = false;
            }
        c.writes++;
      }
      yield* search(0);
    } else {
      const board = input.board.map((row) => [...row]);
      function allowed(r: number, col: number, v: number) {
        for (let i = 0; i < 9; i++) {
          c.comparisons++;
          if (board[r][i] === v || board[i][col] === v) return false;
        }
        for (let a = Math.floor(r / 3) * 3; a < Math.floor(r / 3) * 3 + 3; a++)
          for (
            let b = Math.floor(col / 3) * 3;
            b < Math.floor(col / 3) * 3 + 3;
            b++
          ) {
            c.comparisons++;
            if (board[a][b] === v) return false;
          }
        return true;
      }
      function* solve(): Generator<Frame, boolean> {
        if (++visits > 3000) {
          budgetExceeded = true;
          return false;
        }
        let row = -1,
          col = -1,
          candidates: number[] = [];
        outer: for (let r = 0; r < 9; r++)
          for (let j = 0; j < 9; j++)
            if (board[r][j] === 0) {
              const options = Array.from({ length: 9 }, (_, i) => i + 1).filter(
                (v) => allowed(r, j, v),
              );
              if (!options.length) return false;
              if (row === -1 || options.length < candidates.length) {
                row = r;
                col = j;
                candidates = options;
                if (options.length === 1) break outer;
              }
            }
        if (row === -1) {
          solutions.push(board.flat());
          yield emit('All Sudoku constraints are satisfied.', 5, board);
          return true;
        }
        for (const v of candidates) {
          board[row][col] = v;
          c.writes++;
          yield emit(
            'Choose a legal candidate in a minimum-remaining-values cell.',
            3,
            board,
            { row, column: col, value: v },
          );
          if (yield* solve()) return true;
          board[row][col] = 0;
          c.writes++;
          if (budgetExceeded) return false;
        }
        return false;
      }
      yield* solve();
    }
    const f = emit(
      budgetExceeded
        ? 'The bounded search budget ended; this does not prove no solution.'
        : 'Every requested search branch was explored or a Sudoku solution was found.',
      6,
      [],
      { solutions: solutions.length, visits, budgetExceeded },
    );
    f.state.result = { solutions, count: solutions.length, budgetExceeded };
    yield f;
  },
};
