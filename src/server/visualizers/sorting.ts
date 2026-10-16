import 'server-only';
import type { Visualizer, Frame, ComplexityInfo } from '@/engine/types';
import {
  arrayPresets,
  counters,
  frame,
  validateNumbers,
  randomNumbers,
} from '@/engine/helpers';
import { bubbleSort } from '@/engine/bubble-sort';
import mergeSort from '../../../content/dsa/sorting/merge-sort/visualizer';
const profiles: Record<string, ComplexityInfo> = {
  'selection-sort': {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: false,
    inPlace: true,
    why: 'Every suffix is scanned to choose its minimum; input order does not remove comparisons.',
  },
  'insertion-sort': {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: true,
    inPlace: true,
    why: 'A sorted input needs one comparison per inserted value; reversed inputs shift every previous value.',
  },
  'shell-sort': {
    best: 'O(n log n)',
    average: 'gap-dependent',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: false,
    inPlace: true,
    why: 'Halving gaps move distant values early. The final gap-one pass finishes insertion sorting; gap choice controls the bounds.',
  },
  'quick-sort': {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
    space: 'O(log n) average; O(n) worst',
    stable: false,
    inPlace: true,
    why: 'Balanced partitions give logarithmic depth. A last-element pivot repeatedly chosen at an extreme gives linear recursion depth.',
  },
  'heap-sort': {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(1)',
    stable: false,
    inPlace: true,
    why: 'Building the heap is linear; each of n extractions restores a heap along a logarithmic-height path.',
  },
  'counting-sort': {
    best: 'O(n + k)',
    average: 'O(n + k)',
    worst: 'O(n + k)',
    space: 'O(k)',
    stable: false,
    inPlace: false,
    why: 'Count n integer keys, then scan their range k. This frequency-output variant does not preserve payload stability.',
  },
  'radix-sort': {
    best: 'O(d(n + b))',
    average: 'O(d(n + b))',
    worst: 'O(d(n + b))',
    space: 'O(n + b)',
    stable: true,
    inPlace: false,
    why: 'Every one of d base-b digit passes performs a stable counting sort. Shifting by the minimum handles negative integer inputs.',
  },
  'bucket-sort': {
    best: 'O(n + k)',
    average: 'O(n + k) for uniform input',
    worst: 'O(n²)',
    space: 'O(n + k)',
    stable: true,
    inPlace: false,
    why: 'Uniformly spread values create small buckets; one crowded insertion-sorted bucket has quadratic cost.',
  },
  'tim-sort-overview': {
    best: 'O(n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
    stable: true,
    inPlace: false,
    why: 'This teaching model detects natural runs and stably merges adjacent runs. It omits production TimSort galloping and run-stack policies.',
  },
  'stability-explained': {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1) auxiliary',
    stable: true,
    inPlace: true,
    why: 'Stable insertion moves only strictly larger keys; equal-key records retain their original relative order.',
  },
};
export function sortingVisualizer(id: string): Visualizer {
  const complexity = profiles[id];
  if (!complexity) throw new Error(`Unknown sort: ${id}`);
  const presets =
    id === 'quick-sort'
      ? {
          ...arrayPresets(),
          best: [2, 1, 5, 4, 6, 3],
          worst: [1, 2, 3, 4, 5, 6],
        }
      : id === 'counting-sort'
        ? {
            ...arrayPresets(),
            best: [1, 1, 2, 2, 1, 2],
            worst: [999, -999, 998, -998, 997, -997],
          }
        : id === 'radix-sort'
          ? {
              ...arrayPresets(),
              best: [7, 7, 7, 7, 7, 7],
              worst: [999, -999, 998, -998, 997, -997],
            }
          : id === 'bucket-sort'
            ? {
                ...arrayPresets(),
                best: [0, 100, 200, 300, 400, 500],
                worst: [5, 4, 3, 2, 1, 999],
              }
            : id === 'stability-explained'
              ? {
                  best: [1, 1, 2, 2],
                  average: [2, 1, 2, 1, 3, 2],
                  worst: [3, 2, 2, 1, 1],
                  random: (n: number, s?: number) =>
                    randomNumbers(n, s).map((v) => v % 5),
                }
              : arrayPresets();
  return {
    id,
    complexity,
    presets,
    validateInput: validateNumbers,
    *generate(input) {
      const a = [...input],
        tags = input.map((_, i) => i),
        c = counters(),
        calls: string[] = [];
      const stable = id === 'stability-explained';
      function emit(
        text: string,
        line: number,
        vars: Frame['variables'] = {},
        marks: Frame['highlights'] = [],
        action?: Frame['action'],
      ): Frame {
        return {
          ...frame(
            {
              kind: 'array',
              values: a,
              ...(stable ? { labels: a.map((v, i) => `${v}·${tags[i]}`) } : {}),
            },
            text,
            c,
            line,
            vars,
            marks,
            action,
          ),
          ...(calls.length ? { callStack: [...calls] } : {}),
        };
      }
      function swap(i: number, j: number) {
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          [tags[i], tags[j]] = [tags[j], tags[i]];
          c.swaps++;
          c.reads += 2;
          c.writes += 2;
        }
        return emit(`Exchange positions ${i} and ${j}.`, 4, { i, j }, [
          { id: String(i), kind: 'moving' },
          { id: String(j), kind: 'moving' },
        ]);
      }
      function compare(i: number, j: number, vars: Frame['variables'] = {}) {
        c.comparisons++;
        c.reads += 2;
        return emit(
          `Compare ${a[i]} with ${a[j]}.`,
          3,
          { i, j, ...vars },
          [
            { id: String(i), kind: 'comparing' },
            { id: String(j), kind: 'comparing' },
          ],
          {
            prompt: 'How do these keys compare?',
            choices: ['Left < right', 'Left = right', 'Left > right'],
            answer:
              a[i] < a[j]
                ? 'Left < right'
                : a[i] > a[j]
                  ? 'Left > right'
                  : 'Left = right',
            hint: 'Compare the two highlighted numeric keys.',
          },
        );
      }
      function* insertion(lo = 0, hi = a.length, gap = 1): Generator<Frame> {
        for (let i = lo + gap; i < hi; i += gap) {
          const key = a[i],
            tag = tags[i];
          c.reads++;
          let j = i - gap;
          while (j >= lo) {
            c.comparisons++;
            c.reads++;
            yield emit(
              `Compare ${a[j]} with the held key ${key}.`,
              3,
              { i, j, key, gap },
              [{ id: String(j), kind: 'comparing' }],
              {
                prompt: 'Should the larger key shift right?',
                choices: ['Shift', 'Stop'],
                answer: a[j] > key ? 'Shift' : 'Stop',
                hint: 'Only strictly larger keys move; equal keys keep their order.',
              },
            );
            if (a[j] <= key) break;
            a[j + gap] = a[j];
            tags[j + gap] = tags[j];
            c.reads++;
            c.writes++;
            yield emit('Shift the larger key to make space.', 4, { j, gap }, [
              { id: String(j + gap), kind: 'moving' },
            ]);
            j -= gap;
          }
          a[j + gap] = key;
          tags[j + gap] = tag;
          c.writes++;
          yield emit(
            `Insert ${key} into its gap-sorted position.`,
            5,
            { i, j, gap },
            [{ id: String(j + gap), kind: 'done' }],
          );
        }
      }
      function* quick(lo: number, hi: number): Generator<Frame> {
        if (lo >= hi) return;
        calls.push(`quick(${lo}, ${hi})`);
        const pivot = a[hi];
        c.reads++;
        let i = lo;
        yield emit(`Partition around the last value ${pivot}.`, 2, {
          lo,
          hi,
          pivot,
        });
        for (let j = lo; j < hi; j++) {
          c.comparisons++;
          c.reads++;
          yield emit(
            `Compare ${a[j]} with pivot ${pivot}.`,
            3,
            { i, j, pivot },
            [
              { id: String(j), kind: 'comparing' },
              { id: String(hi), kind: 'queued' },
            ],
            {
              prompt: 'Does this value belong on the left?',
              choices: ['Left', 'Right'],
              answer: a[j] <= pivot ? 'Left' : 'Right',
              hint: 'The left partition contains values no greater than the pivot.',
            },
          );
          if (a[j] <= pivot) {
            if (i !== j) yield swap(i, j);
            i++;
          }
        }
        if (i !== hi) yield swap(i, hi);
        yield emit(
          'The pivot is now in its final position.',
          5,
          { pivotIndex: i },
          [{ id: String(i), kind: 'done' }],
        );
        yield* quick(lo, i - 1);
        yield* quick(i + 1, hi);
        calls.pop();
      }
      function* sift(root: number, size: number): Generator<Frame> {
        for (;;) {
          let largest = root;
          const left = root * 2 + 1,
            right = left + 1;
          if (left < size) {
            yield compare(left, largest, { size });
            if (a[left] > a[largest]) largest = left;
          }
          if (right < size) {
            yield compare(right, largest, { size });
            if (a[right] > a[largest]) largest = right;
          }
          if (largest === root) return;
          yield swap(root, largest);
          root = largest;
        }
      }
      function* merge(lo: number, mid: number, hi: number): Generator<Frame> {
        const left = a.slice(lo, mid),
          right = a.slice(mid, hi);
        let i = 0,
          j = 0;
        for (let k = lo; k < hi; k++) {
          if (i < left.length && j < right.length) {
            c.comparisons++;
            c.reads += 2;
            yield emit('Compare the fronts of two sorted runs.', 3, {
              lo,
              mid,
              hi,
              i,
              j,
            });
          }
          a[k] =
            j === right.length || (i < left.length && left[i] <= right[j])
              ? left[i++]
              : right[j++];
          c.reads++;
          c.writes++;
          yield emit('Copy the next value into the merged run.', 5, { k }, [
            { id: String(k), kind: 'moving' },
          ]);
        }
      }
      yield emit('Start with the selected input.', 1);
      switch (id) {
        case 'selection-sort':
          for (let i = 0; i < a.length - 1; i++) {
            let min = i;
            for (let j = i + 1; j < a.length; j++) {
              yield compare(j, min, { i, min });
              if (a[j] < a[min]) min = j;
            }
            if (min !== i) yield swap(i, min);
            yield emit(
              'The smallest remaining value joins the sorted prefix.',
              5,
              { i },
              [{ id: String(i), kind: 'done' }],
            );
          }
          break;
        case 'insertion-sort':
        case 'stability-explained':
          yield* insertion();
          break;
        case 'shell-sort':
          for (
            let gap = Math.floor(a.length / 2);
            gap > 0;
            gap = Math.floor(gap / 2)
          ) {
            yield emit(`Sort subsequences separated by gap ${gap}.`, 2, {
              gap,
            });
            for (let start = 0; start < gap; start++)
              yield* insertion(start, a.length, gap);
          }
          break;
        case 'quick-sort':
          yield* quick(0, a.length - 1);
          break;
        case 'heap-sort':
          for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--)
            yield* sift(i, a.length);
          for (let end = a.length - 1; end > 0; end--) {
            yield swap(0, end);
            yield emit('The maximum leaves the active heap.', 5, { end }, [
              { id: String(end), kind: 'done' },
            ]);
            yield* sift(0, end);
          }
          break;
        case 'counting-sort': {
          c.reads += 2 * a.length;
          c.comparisons += 2 * Math.max(0, a.length - 1);
          const min = Math.min(...a),
            max = Math.max(...a),
            counts = Array(max - min + 1).fill(0) as number[];
          for (const value of a) {
            c.reads += 2;
            yield emit(
              `Read the current frequency of ${value}.`,
              2,
              { value, count: counts[value - min] },
              [],
              {
                prompt: 'What should this bucket count become?',
                choices: [
                  String(counts[value - min] + 1),
                  String(counts[value - min]),
                ],
                answer: String(counts[value - min] + 1),
                hint: 'One more occurrence increases the count by exactly one.',
              },
            );
            counts[value - min]++;
            c.writes++;
            yield emit(`Count another occurrence of ${value}.`, 2, {
              value,
              count: counts[value - min],
            });
          }
          let k = 0;
          for (let i = 0; i < counts.length; i++) {
            c.reads++;
            for (let repeat = 0; repeat < counts[i]; repeat++) {
              a[k] = i + min;
              c.writes++;
              yield emit(
                `Emit key ${i + min} from its frequency bucket.`,
                5,
                { key: i + min, k },
                [{ id: String(k++), kind: 'done' }],
              );
            }
          }
          break;
        }
        case 'radix-sort': {
          c.reads += 3 * a.length;
          c.writes += a.length;
          c.comparisons += 2 * Math.max(0, a.length - 1);
          const shift = Math.min(...a);
          let values = a.map((v) => v - shift);
          const max = Math.max(...values);
          for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            const count = Array(10).fill(0) as number[],
              out = Array(a.length).fill(0) as number[];
            for (const value of values) {
              const digit = Math.floor(value / exp) % 10;
              c.reads++;
              yield emit(
                'Choose the bucket for the current shifted digit.',
                2,
                { value, exp, shift },
                [],
                {
                  prompt: 'Which digit bucket receives this value?',
                  choices: Array.from({ length: 10 }, (_, i) => String(i)),
                  answer: String(digit),
                  hint: 'Divide by the place value, discard the fractional part and take the last decimal digit.',
                },
              );
              count[digit]++;
              c.writes++;
            }
            for (let i = 1; i < 10; i++) {
              count[i] += count[i - 1];
              c.reads += 2;
              c.writes++;
            }
            for (let i = values.length - 1; i >= 0; i--) {
              const digit = Math.floor(values[i] / exp) % 10;
              out[--count[digit]] = values[i];
              c.reads += 2;
              c.writes += 2;
            }
            values = out;
            for (let i = 0; i < a.length; i++) {
              a[i] = values[i] + shift;
              c.reads++;
              c.writes++;
              yield emit(
                `Stable digit pass at place ${exp}.`,
                5,
                { exp, i, shift },
                [{ id: String(i), kind: 'moving' }],
              );
            }
          }
          break;
        }
        case 'bucket-sort': {
          c.reads += 2 * a.length;
          c.comparisons += 2 * Math.max(0, a.length - 1);
          const min = Math.min(...a),
            max = Math.max(...a),
            k = Math.max(1, Math.ceil(Math.sqrt(a.length)));
          const buckets = Array.from({ length: k }, () => [] as number[]);
          for (const value of a) {
            const b = Math.min(
              k - 1,
              Math.floor(((value - min) / (max - min + 1)) * k),
            );
            c.reads++;
            yield emit(
              'Choose the range bucket for this value.',
              2,
              { value, min, max, k },
              [],
              {
                prompt: 'Which range bucket receives this value?',
                choices: Array.from({ length: k }, (_, i) => String(i)),
                answer: String(b),
                hint: 'Scale (value−min) into k equal-width ranges; clamp the maximum into the last bucket.',
              },
            );
            buckets[b].push(value);
            c.writes++;
            yield emit(`Place ${value} in bucket ${b}.`, 2, { value, b });
          }
          let dest = 0;
          for (let b = 0; b < k; b++) {
            const bucket = buckets[b];
            for (let i = 1; i < bucket.length; i++) {
              const value = bucket[i];
              let j = i - 1;
              while (j >= 0) {
                c.comparisons++;
                c.reads++;
                if (bucket[j] <= value) break;
                bucket[j + 1] = bucket[j];
                c.writes++;
                j--;
              }
              bucket[j + 1] = value;
              c.writes++;
            }
            for (const value of bucket) {
              a[dest] = value;
              c.reads++;
              c.writes++;
              yield emit(
                `Read sorted bucket ${b} back into the array.`,
                5,
                { b, dest },
                [{ id: String(dest++), kind: 'done' }],
              );
            }
          }
          break;
        }
        case 'tim-sort-overview': {
          let start = 0;
          let runs: { lo: number; hi: number }[] = [];
          while (start < a.length) {
            let end = start + 1;
            let descending = false;
            if (end < a.length) {
              yield compare(end, start);
              descending = a[end] < a[start];
            }
            while (end < a.length) {
              yield compare(end, end - 1);
              if (descending ? a[end] >= a[end - 1] : a[end] < a[end - 1])
                break;
              end++;
            }
            if (descending)
              for (let i = start, j = end - 1; i < j; i++, j--)
                yield swap(i, j);
            const extended = end;
            runs.push({ lo: start, hi: extended });
            yield emit('Keep a natural sorted run for later merging.', 2, {
              start,
              end: extended,
            });
            start = extended;
          }
          while (runs.length > 1) {
            const next: typeof runs = [];
            for (let i = 0; i < runs.length; i += 2) {
              if (i + 1 < runs.length) {
                yield* merge(runs[i].lo, runs[i].hi, runs[i + 1].hi);
                next.push({ lo: runs[i].lo, hi: runs[i + 1].hi });
              } else next.push(runs[i]);
            }
            runs = next;
          }
          break;
        }
      }
      const final = emit(
        'Every key is in sorted order.',
        6,
        { ...(stable ? { originalIndices: tags.join(', ') } : {}) },
        a.map((_, i) => ({ id: String(i), kind: 'done' })),
      );
      final.state.result = [...a];
      yield final;
    },
  };
}
export const raceVisualizer: Visualizer = {
  id: 'sorting-algorithm-race',
  complexity: {
    best: 'algorithm-dependent',
    average: 'Compare measured counters',
    worst: 'Bubble O(n²), Merge O(n log n), Quick O(n²)',
    space: 'algorithm-dependent',
    why: 'All runners receive the same values and advance together. Counters measure each implementation rather than wall-clock timing.',
  },
  presets: arrayPresets(),
  validateInput: validateNumbers,
  *generate(input) {
    const runners = [
      bubbleSort.generate(input),
      mergeSort.generate(input),
      sortingVisualizer('quick-sort').generate(input),
    ];
    let frames = runners.map((r) => r.next());
    let finalCounters = counters();
    while (frames.some((f) => !f.done)) {
      const snapshots = frames.map((f) => f.value as Frame | undefined);
      const current = snapshots.filter((f): f is Frame => Boolean(f));
      if (current.length) {
        const c = counters();
        current.forEach((f, i) => {
          for (const key of [
            'comparisons',
            'swaps',
            'reads',
            'writes',
          ] as const)
            c[key] += f.counters[key];
          c[['Bubble', 'Merge', 'Quick'][i] + ' comparisons'] =
            f.counters.comparisons;
        });
        finalCounters = { ...c };
        yield frame(
          {
            kind: 'grid',
            values: [...input],
            rows: current.map((f) => f.state.values),
            labels: ['Bubble', 'Merge', 'Quick'],
          },
          'Compare equal-step progress and the work done by each runner.',
          c,
          3,
          { runners: 3 },
          [],
          {
            prompt: 'Which runner has made the fewest comparisons so far?',
            choices: ['Bubble', 'Merge', 'Quick', 'Tie'],
            answer: (() => {
              const costs = snapshots.map((f) => f?.counters.comparisons ?? 0),
                least = Math.min(...costs),
                winners = costs.flatMap((value, i) =>
                  value === least ? [i] : [],
                );
              return winners.length === 1
                ? ['Bubble', 'Merge', 'Quick'][winners[0]]
                : 'Tie';
            })(),
            hint: 'Compare each runner’s comparison counter. Equal minima count as a tie; this is a work count, not elapsed time.',
          },
        );
      }
      frames = frames.map((f, i) => {
        if (f.done) return f;
        const next = runners[i].next();
        return next.done ? { done: true, value: f.value } : next;
      });
    }
    const final = frame(
      {
        kind: 'grid',
        values: [...input].sort((a, b) => a - b),
        rows: [0, 1, 2].map(() => [...input].sort((a, b) => a - b)),
        result: [...input].sort((a, b) => a - b),
      },
      'All three algorithms sorted the same input.',
      finalCounters,
      6,
    );
    yield final;
  },
};

/** Hoare's boundary is not a finalized pivot position. */
export const quickHoare: Visualizer = {
  id: 'quick-sort',
  variantTitle: 'Hoare partition',
  presets: {
    ...arrayPresets(),
    best: [1, 2, 3, 4, 5, 6],
    worst: [1, 3, 5, 7, 6, 4, 2],
  },
  validateInput: validateNumbers,
  complexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
    space: 'O(log n) average stack; O(n) worst',
    stable: false,
    inPlace: true,
    why: 'Two inward scans exchange out-of-partition pairs. Hoare returns a split boundary, so recursive intervals are [lo,boundary] and [boundary+1,hi], not Lomuto’s pivot-excluding intervals.',
  },
  *generate(input) {
    const a = [...input],
      c = counters(),
      calls: string[] = [];
    const emit = (
      text: string,
      line: number,
      vars: Frame['variables'] = {},
      marks: Frame['highlights'] = [],
      action?: Frame['action'],
    ) => ({
      ...frame(
        { kind: 'array', values: a },
        text,
        c,
        line,
        vars,
        marks,
        action,
      ),
      callStack: [...calls],
    });
    yield emit('Hoare scans inward around a copied middle pivot value.', 1);
    function* sort(lo: number, hi: number): Generator<Frame> {
      if (lo >= hi) return;
      calls.push(`sort(${lo},${hi})`);
      const pivot = a[lo + Math.floor((hi - lo) / 2)];
      c.reads++;
      let i = lo - 1,
        j = hi + 1;
      yield emit(
        'The pivot value guides two scans without requiring a final pivot slot.',
        2,
        { lo, hi, pivot },
      );
      while (true) {
        do {
          i++;
          c.reads++;
          c.comparisons++;
          yield emit(
            'Advance the left scan while values are below the pivot.',
            3,
            { i, j, pivot },
            [{ id: String(i), kind: 'comparing' }],
            {
              prompt: 'Should the left scan continue?',
              choices: ['Continue right', 'Stop left scan'],
              answer: a[i] < pivot ? 'Continue right' : 'Stop left scan',
              hint: 'Stop at a value at least as large as the copied pivot.',
            },
          );
        } while (a[i] < pivot);
        do {
          j--;
          c.reads++;
          c.comparisons++;
          yield emit(
            'Advance the right scan while values are above the pivot.',
            3,
            { i, j, pivot },
            [{ id: String(j), kind: 'comparing' }],
          );
        } while (a[j] > pivot);
        if (i >= j) break;
        [a[i], a[j]] = [a[j], a[i]];
        c.swaps++;
        c.writes += 2;
        yield emit(
          'Exchange the out-of-partition pair, then continue both scans.',
          4,
          { i, j, pivot },
          [
            { id: String(i), kind: 'moving' },
            { id: String(j), kind: 'moving' },
          ],
        );
      }
      yield emit(
        'The scans crossed: this boundary separates two recursive intervals.',
        5,
        { boundary: j, lo, hi },
      );
      yield* sort(lo, j);
      yield* sort(j + 1, hi);
      calls.pop();
    }
    yield* sort(0, a.length - 1);
    const f = emit('Every recursive interval is ordered.', 6);
    f.state.result = [...a];
    yield f;
  },
};
