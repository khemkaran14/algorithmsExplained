import { withLineMap } from './helpers';
import type { Visualizer } from './types';
import { counters, frame, randomNumbers, validateNumbers } from './helpers';
const implementation: Visualizer = {
  id: 'binary-search',
  validateInput(raw) {
    const a = validateNumbers(raw);
    if (a.some((v, i) => i > 0 && v < a[i - 1]))
      throw new Error('Binary search needs numbers in ascending order.');
    return a;
  },
  presets: {
    best: [1, 2, 3, 4, 5],
    average: [1, 2, 3, 4, 5, 6],
    worst: [1, 2, 3, 4, 5, 6, 7, 8],
    random: (n, s) => randomNumbers(n, s).sort((a, b) => a - b),
  },
  complexity: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    space: 'O(1)',
    why: 'Each comparison removes at least half of the remaining sorted search interval.',
  },
  *generate(input) {
    const a = [...input],
      c = counters();
    const target =
      a.length % 2 === 1 ? a[Math.floor((a.length - 1) / 2)] : a[a.length - 1];
    let low = 0,
      high = a.length - 1;
    yield frame(
      { kind: 'boxes', values: a },
      `Find ${target} in this sorted array.`,
      c,
      1,
      { target, low, high },
    );
    while (low <= high) {
      const mid = low + Math.floor((high - low) / 2);
      c.comparisons++;
      c.reads++;
      const answer =
        a[mid] === target ? 'Found' : a[mid] < target ? 'Right' : 'Left';
      yield frame(
        { kind: 'boxes', values: a },
        `Compare the middle value ${a[mid]} with ${target}.`,
        c,
        3,
        { target, low, high, mid },
        [{ id: String(mid), kind: 'comparing' }],
        {
          prompt: 'Which part should we search next?',
          choices: ['Left', 'Right', 'Found'],
          answer,
          hint: 'The input is sorted: smaller values are on the left, larger values on the right.',
        },
      );
      if (a[mid] === target) {
        yield frame(
          { kind: 'boxes', values: a, result: mid },
          `Found ${target} at index ${mid}.`,
          c,
          4,
          { target, mid },
          [{ id: String(mid), kind: 'done' }],
        );
        return;
      }
      if (a[mid] < target) low = mid + 1;
      else high = mid - 1;
      yield frame(
        { kind: 'boxes', values: a },
        'Discard the half that cannot contain the target.',
        c,
        5,
        { target, low, high },
        a.map((_, i) => ({
          id: String(i),
          kind: i < low || i > high ? 'visited' : 'default',
        })),
      );
    }
    yield frame(
      { kind: 'boxes', values: a, result: -1 },
      'The target is not in the array.',
      c,
      6,
      { target },
    );
  },
};

export const binarySearch = withLineMap(implementation, {
  python: { '1': 2, '3': 4, '4': 5, '5': 6, '6': 8 },
});
