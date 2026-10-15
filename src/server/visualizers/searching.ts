import 'server-only';
import { z } from 'zod';
import type { Visualizer, Frame, ComplexityInfo } from '@/engine/types';
import { counters, frame, randomNumbers } from '@/engine/helpers';
const values = z.array(z.number().int().min(-999).max(999)).min(1).max(64);
const querySchema = z.object({
  values,
  target: z.number().int().min(-999).max(999),
});
const partitionSchema = z.object({
  weights: z.array(z.number().int().min(0).max(999)).min(1).max(64),
  groups: z.number().int().min(1).max(64),
});
type Query = z.infer<typeof querySchema>;
type Partition = z.infer<typeof partitionSchema>;
const profiles: Record<string, ComplexityInfo> = {
  'linear-search': {
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(1)',
    why: 'Inspect values one by one; an absent target requires visiting every position.',
  },
  'lower-upper-bound': {
    best: 'O(log n)',
    average: 'O(log n)',
    worst: 'O(log n)',
    space: 'O(1)',
    why: 'Two binary searches find the first key ≥ target and the first key > target in sorted data.',
  },
  'ternary-search': {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    space: 'O(1)',
    why: 'Two probes discard roughly two thirds of the remaining sorted interval; the extra probes need not beat binary search.',
  },
  'exponential-search': {
    best: 'O(1)',
    average: 'O(log i)',
    worst: 'O(log n)',
    space: 'O(1)',
    why: 'Doubling finds a bound near target position i, followed by a binary search within that bound.',
  },
  'interpolation-search': {
    best: 'O(1)',
    average: 'O(log log n) for uniform keys',
    worst: 'O(n)',
    space: 'O(1)',
    why: 'Estimate the target position from its value. Uniform spacing helps; skewed keys can make the estimate advance only one position.',
  },
  'binary-search-on-answer': {
    best: 'O(n) for a single-point range',
    average: 'O(n log S)',
    worst: 'O(n log S)',
    space: 'O(1)',
    why: 'Binary-search the capacity range S; each candidate is checked by a linear greedy scan of the weights.',
  },
};
export function searchVisualizer(id: string): Visualizer<Query | Partition> {
  const complexity = profiles[id];
  if (!complexity) throw new Error('Unknown search');
  const partition = id === 'binary-search-on-answer';
  const q = (target: number, values: number[] = [1, 2, 3, 4, 5, 6]): Query => ({
    values,
    target,
  });
  const presets: Visualizer<Query | Partition>['presets'] = partition
    ? {
        best: { weights: [8], groups: 1 },
        average: { weights: [7, 2, 5, 10, 8], groups: 2 },
        worst: { weights: [999, 1, 999, 1, 999, 1], groups: 3 },
        random: (n, s) => ({
          weights: randomNumbers(n, s),
          groups: Math.min(3, n),
        }),
      }
    : {
        best: q(
          id === 'interpolation-search' ? 4 : id === 'ternary-search' ? 2 : 1,
        ),
        average: id === 'lower-upper-bound' ? q(2, [1, 2, 2, 2, 4, 5]) : q(4),
        worst: q(
          id === 'interpolation-search' ? 5 : 99,
          id === 'interpolation-search'
            ? [1, 2, 3, 4, 5, 999]
            : [1, 2, 3, 4, 5, 6],
        ),
        random: (n, s) => {
          const a = randomNumbers(n, s).sort((a, b) => a - b);
          return q(a[Math.floor(a.length * 0.7)], a);
        },
      };
  return {
    id,
    complexity,
    presets,
    inputHint: partition
      ? 'Enter {"weights":[7,2,5,10,8],"groups":2}. Groups are contiguous; weights must be nonnegative.'
      : 'Enter {"values":[1,2,3,4,5],"target":4}. All searches except linear search require ascending values.',
    validateInput(raw) {
      let input = raw;
      if (typeof raw === 'string') {
        try {
          input = JSON.parse(raw);
        } catch {
          throw new Error('Enter a valid JSON object.');
        }
      }
      if (partition) {
        const p = partitionSchema.safeParse(input);
        if (!p.success || p.data.groups > p.data.weights.length)
          throw new Error(
            'Use 1–64 nonnegative weights and between 1 and n groups.',
          );
        return p.data;
      }
      const q = querySchema.safeParse(input);
      if (!q.success)
        throw new Error('Use 1–64 bounded integers and an integer target.');
      if (
        id !== 'linear-search' &&
        q.data.values.some((v, i) => i > 0 && v < q.data.values[i - 1])
      )
        throw new Error('This search requires values in ascending order.');
      return q.data;
    },
    *generate(input) {
      const c = counters();
      if ('weights' in input) {
        const a = input.weights;
        let low = Math.max(...a),
          high = a.reduce((n, v) => n + v, 0);
        c.reads += a.length * 2;
        c.comparisons += Math.max(0, a.length - 1);
        yield frame(
          { kind: 'array', values: a },
          'Find the smallest capacity that can pack contiguous groups.',
          c,
          1,
          { low, high, groups: input.groups },
          [],
          {
            prompt: 'What lower bound must every capacity satisfy?',
            choices: ['At least the largest weight', 'Always zero'],
            answer: 'At least the largest weight',
            hint: 'A group must fit its largest indivisible weight.',
          },
        );
        while (low < high) {
          const capacity = low + Math.floor((high - low) / 2);
          let groups = 1,
            load = 0;
          for (let i = 0; i < a.length; i++) {
            c.reads++;
            c.comparisons++;
            if (load + a[i] > capacity) {
              groups++;
              load = 0;
            }
            load += a[i];
            yield frame(
              { kind: 'array', values: a },
              `Check weight ${a[i]} against capacity ${capacity}.`,
              c,
              3,
              { capacity, groups, load, i },
              [{ id: String(i), kind: 'comparing' }],
            );
          }
          const feasible = groups <= input.groups;
          yield frame(
            { kind: 'array', values: a },
            feasible
              ? 'This capacity fits within the allowed group count.'
              : 'This capacity needs too many groups.',
            c,
            4,
            { capacity, groups, low, high },
            [],
            {
              prompt: 'Is this capacity feasible?',
              choices: ['Feasible', 'Too small'],
              answer: feasible ? 'Feasible' : 'Too small',
              hint: 'The candidate is feasible only if it needs no more than the allowed number of contiguous groups.',
            },
          );
          if (feasible) high = capacity;
          else low = capacity + 1;
          yield frame(
            { kind: 'array', values: a },
            'Keep only capacities that could still be optimal.',
            c,
            5,
            { low, high },
          );
        }
        yield frame(
          { kind: 'array', values: a, result: low },
          `The minimum feasible capacity is ${low}.`,
          c,
          6,
          { capacity: low },
        );
        return;
      }
      const a = [...input.values],
        target = input.target;
      function emit(
        text: string,
        line: number,
        vars: Frame['variables'] = {},
        marks: Frame['highlights'] = [],
        action?: Frame['action'],
      ) {
        return frame(
          { kind: 'boxes', values: a },
          text,
          c,
          line,
          { target, ...vars },
          marks,
          action,
        );
      }
      function found(index: number) {
        const f = emit(
          index >= 0
            ? `Found the target at index ${index}.`
            : 'The target is not present.',
          6,
          { index },
          index >= 0 ? [{ id: String(index), kind: 'done' }] : [],
        );
        f.state.result = index;
        return f;
      }
      yield emit(`Search for ${target}.`, 1);
      if (id === 'linear-search') {
        for (let i = 0; i < a.length; i++) {
          c.reads++;
          c.comparisons++;
          yield emit(
            `Compare ${a[i]} with ${target}.`,
            3,
            { i },
            [{ id: String(i), kind: 'comparing' }],
            {
              prompt: 'Is this the target?',
              choices: ['Match', 'Continue'],
              answer: a[i] === target ? 'Match' : 'Continue',
              hint: 'A linear search stops at the first equal value.',
            },
          );
          if (a[i] === target) {
            yield found(i);
            return;
          }
        }
        yield found(-1);
        return;
      }
      if (id === 'lower-upper-bound') {
        const answers: number[] = [];
        for (const mode of ['lower', 'upper'] as const) {
          let low = 0,
            high = a.length;
          while (low < high) {
            const mid = low + Math.floor((high - low) / 2);
            const left = mode === 'lower' ? a[mid] >= target : a[mid] > target;
            c.reads++;
            c.comparisons++;
            yield emit(
              `Find the ${mode} boundary using a half-open interval.`,
              3,
              { low, high, mid, mode },
              [{ id: String(mid), kind: 'comparing' }],
              {
                prompt: 'Which half retains this boundary?',
                choices: ['Left', 'Right'],
                answer: left ? 'Left' : 'Right',
                hint:
                  mode === 'lower'
                    ? 'Keep the first key greater than or equal to the target.'
                    : 'Keep the first key strictly greater than the target.',
              },
            );
            if (left) high = mid;
            else low = mid + 1;
            yield emit('Shrink the half-open search interval.', 5, {
              low,
              high,
              mode,
            });
          }
          answers.push(low);
        }
        const f = emit(
          `The equal-key range is [${answers[0]}, ${answers[1]}).`,
          6,
          { lower: answers[0], upper: answers[1] },
        );
        f.state.result = answers;
        yield f;
        return;
      }
      let low = 0,
        high = a.length - 1;
      if (id === 'exponential-search') {
        c.reads++;
        c.comparisons++;
        yield emit(
          'Check the first position before doubling the search bound.',
          3,
          { index: 0 },
          [{ id: '0', kind: 'comparing' }],
          {
            prompt: 'Is the first value the target?',
            choices: ['Match', 'Continue'],
            answer: a[0] === target ? 'Match' : 'Continue',
            hint: 'An immediate match avoids all bound expansion.',
          },
        );
        if (a[0] === target) {
          yield found(0);
          return;
        }
        let bound = 1;
        while (bound < a.length) {
          c.reads++;
          c.comparisons++;
          yield emit(`Probe the doubling bound at ${bound}.`, 2, { bound }, [
            { id: String(bound), kind: 'comparing' },
          ]);
          if (a[bound] >= target) break;
          bound *= 2;
        }
        low = Math.floor(bound / 2);
        high = Math.min(bound, a.length - 1);
        yield emit('The target can only be inside this bounded interval.', 4, {
          low,
          high,
        });
      }
      while (low <= high) {
        if (id === 'ternary-search') {
          const third = Math.floor((high - low) / 3),
            m1 = low + third,
            m2 = high - third;
          c.reads++;
          c.comparisons++;
          yield emit(
            'Compare the first third-point with the target.',
            3,
            { low, high, m1, m2 },
            [{ id: String(m1), kind: 'comparing' }],
            {
              prompt: 'Does this first probe match?',
              choices: ['Match', 'Continue'],
              answer: a[m1] === target ? 'Match' : 'Continue',
              hint: 'Compare the probe value with the target.',
            },
          );
          if (a[m1] === target) {
            yield found(m1);
            return;
          }
          c.reads++;
          c.comparisons++;
          yield emit(
            'Compare the second third-point with the target.',
            4,
            { low, high, m1, m2 },
            [{ id: String(m2), kind: 'comparing' }],
            {
              prompt: 'Does this second probe match?',
              choices: ['Match', 'Continue'],
              answer: a[m2] === target ? 'Match' : 'Continue',
              hint: 'Compare the probe value with the target.',
            },
          );
          if (a[m2] === target) {
            yield found(m2);
            return;
          }
          c.comparisons++;
          if (target < a[m1]) high = m1 - 1;
          else {
            c.comparisons++;
            if (target > a[m2]) low = m2 + 1;
            else {
              low = m1 + 1;
              high = m2 - 1;
            }
          }
        } else {
          let mid = low + Math.floor((high - low) / 2);
          if (id === 'interpolation-search') {
            c.reads += 2;
            c.comparisons += 2;
            if (target < a[low] || target > a[high]) break;
            if (a[low] === a[high]) {
              yield found(a[low] === target ? low : -1);
              return;
            }
            mid = Math.max(
              low,
              Math.min(
                high,
                low +
                  Math.floor(
                    ((target - a[low]) * (high - low)) / (a[high] - a[low]),
                  ),
              ),
            );
          }
          c.reads++;
          c.comparisons++;
          yield emit(
            `Probe index ${mid}, whose value is ${a[mid]}.`,
            3,
            { low, high, mid },
            [{ id: String(mid), kind: 'comparing' }],
            {
              prompt: 'Which direction still contains the target?',
              choices: ['Left', 'Right', 'Found'],
              answer:
                a[mid] === target
                  ? 'Found'
                  : a[mid] < target
                    ? 'Right'
                    : 'Left',
              hint: 'Use the sorted order to exclude impossible positions.',
            },
          );
          if (a[mid] === target) {
            yield found(mid);
            return;
          }
          c.comparisons++;
          if (a[mid] < target) low = mid + 1;
          else high = mid - 1;
        }
        yield emit('Discard the interval that cannot contain the target.', 5, {
          low,
          high,
        });
      }
      yield found(-1);
    },
  };
}
