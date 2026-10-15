import { withLineMap } from './helpers';
import type { Visualizer } from './types';
import { arrayPresets, counters, frame, validateNumbers } from './helpers';
const implementation: Visualizer = {
  id: 'big-o',
  presets: arrayPresets(),
  validateInput: validateNumbers,
  complexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(1)',
    why: 'This single-pass sum visits each element exactly once, so doubling n doubles its reads.',
  },
  *generate(input) {
    const c = counters();
    let sum = 0;
    yield frame(
      { kind: 'growth', values: [...input] },
      'Count one read for each value in this single-pass sum.',
      c,
      1,
      { n: input.length, sum },
    );
    for (let i = 0; i < input.length; i++) {
      yield frame(
        { kind: 'growth', values: [...input] },
        `Read value ${input[i]} at index ${i}.`,
        c,
        2,
        { i, sum, n: input.length },
        [{ id: String(i), kind: 'comparing' }],
        {
          prompt: 'How many additional reads does this step need?',
          choices: ['1', 'n', 'n²'],
          answer: '1',
          hint: 'A single loop iteration reads one value.',
        },
      );
      sum += input[i];
      c.reads++;
      yield frame(
        { kind: 'growth', values: [...input] },
        `The sum is now ${sum}; reads increase by one.`,
        c,
        3,
        { i, sum, n: input.length },
        [{ id: String(i), kind: 'visited' }],
      );
    }
    yield frame(
      { kind: 'growth', values: [...input], result: sum },
      `${input.length} values required exactly ${c.reads} reads.`,
      c,
      6,
      { sum, n: input.length },
    );
  },
};

export const bigO = withLineMap(implementation, {
  python: { '1': 2, '2': 3 },
  java: { '1': 2, '2': 3 },
  cpp: { '1': 2, '2': 3 },
});
