import { withLineMap } from './helpers';
import type { Visualizer } from './types';
import { arrayPresets, counters, frame, validateNumbers } from './helpers';
const implementation: Visualizer = {
  id: 'bubble-sort',
  validateInput: validateNumbers,
  presets: arrayPresets(),
  complexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    stable: true,
    inPlace: true,
    why: 'Each pass compares neighbors; n−1 passes can scan almost n items. A no-swap pass stops early.',
  },
  *generate(input) {
    const a = [...input],
      c = counters();
    yield frame(
      { kind: 'array', values: a },
      'Start with the unsorted array.',
      c,
      1,
    );
    for (let end = a.length - 1; end > 0; end--) {
      let swapped = false;
      for (let j = 0; j < end; j++) {
        c.comparisons++;
        c.reads += 2;
        const answer = a[j] > a[j + 1] ? 'Swap' : 'Keep';
        yield frame(
          { kind: 'array', values: a },
          `Compare ${a[j]} and ${a[j + 1]}.`,
          c,
          3,
          { j, end, swapped },
          [
            { id: String(j), kind: 'comparing' },
            { id: String(j + 1), kind: 'comparing' },
          ],
          {
            prompt: 'Should these neighbors swap?',
            choices: ['Swap', 'Keep'],
            answer,
            hint: 'Swap only when the left value is greater than the right.',
          },
        );
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          c.swaps++;
          c.writes += 2;
          swapped = true;
          yield frame(
            { kind: 'array', values: a },
            'Move the larger value one place to the right.',
            c,
            4,
            { j, end, swapped },
            [
              { id: String(j), kind: 'moving' },
              { id: String(j + 1), kind: 'moving' },
            ],
          );
        }
      }
      yield frame(
        { kind: 'array', values: a },
        `${a[end]} is in its final position.`,
        c,
        5,
        { end, swapped },
        [{ id: String(end), kind: 'done' }],
      );
      if (!swapped) break;
    }
    yield frame(
      { kind: 'array', values: a, result: [...a] },
      'Every value is now in order.',
      c,
      6,
      {},
      a.map((_, i) => ({ id: String(i), kind: 'done' })),
    );
  },
};

export const bubbleSort = withLineMap(implementation, {
  python: { '1': 1, '3': 4, '4': 5, '5': 6, '6': 7 },
});
