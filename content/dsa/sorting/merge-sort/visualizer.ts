import type { Visualizer, Frame } from '../../../../src/engine/types';
import {
  arrayPresets,
  counters,
  frame,
  validateNumbers,
} from '../../../../src/engine/helpers';
const mergeSort: Visualizer = {
  id: 'merge-sort',
  presets: arrayPresets(),
  validateInput: validateNumbers,
  complexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
    stable: true,
    inPlace: false,
    why: 'There are log₂ n splitting levels; merging each level touches all n elements. The temporary buffer holds at most n values.',
  },
  *generate(input) {
    const a = [...input],
      c = counters(),
      calls: string[] = [];
    function emit(
      narration: string,
      line: number,
      vars: Frame['variables'] = {},
      marks: Frame['highlights'] = [],
      action?: Frame['action'],
    ) {
      return {
        ...frame(
          { kind: 'array', values: a },
          narration,
          c,
          line,
          vars,
          marks,
          action,
        ),
        callStack: [...calls],
      };
    }
    function* sort(lo: number, hi: number): Generator<Frame> {
      calls.push(`sort(${lo}, ${hi})`);
      if (hi - lo <= 1) {
        calls.pop();
        return;
      }
      const mid = lo + Math.floor((hi - lo) / 2);
      yield emit('Split this interval into two smaller sorting problems.', 2, {
        lo,
        mid,
        hi,
      });
      yield* sort(lo, mid);
      yield* sort(mid, hi);
      const left = a.slice(lo, mid),
        right = a.slice(mid, hi);
      let i = 0,
        j = 0,
        k = lo;
      yield emit('Merge the two sorted halves without losing their order.', 3, {
        lo,
        mid,
        hi,
      });
      while (i < left.length || j < right.length) {
        if (i < left.length && j < right.length) {
          c.comparisons++;
          c.reads += 2;
          yield emit(
            `Compare the next candidates ${left[i]} and ${right[j]}.`,
            4,
            { i, j, k },
            [
              { id: String(lo + i), kind: 'comparing' },
              { id: String(mid + j), kind: 'comparing' },
            ],
            {
              prompt: 'Which half supplies the next value?',
              choices: ['Left', 'Right'],
              answer: left[i] <= right[j] ? 'Left' : 'Right',
              hint: 'Choose the smaller value; choose left on a tie to preserve stability.',
            },
          );
        }
        a[k] =
          j >= right.length || (i < left.length && left[i] <= right[j])
            ? left[i++]
            : right[j++];
        c.reads++;
        c.writes++;
        yield emit(`Write ${a[k]} into the merged interval.`, 5, { i, j, k }, [
          { id: String(k), kind: 'moving' },
        ]);
        k++;
      }
      calls.pop();
    }
    yield emit('Two sorted streams become one ordered sequence.', 1);
    yield* sort(0, a.length);
    const final = emit(
      'The complete array is now sorted.',
      6,
      {},
      a.map((_, i) => ({ id: String(i), kind: 'done' })),
    );
    final.state.result = [...a];
    yield final;
  },
};
export default mergeSort;
