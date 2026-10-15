import { withLineMap } from './helpers';
import type { Visualizer } from './types';
import { arrayPresets, counters, frame, validateNumbers } from './helpers';
const implementation: Visualizer = {
  id: 'stack',
  presets: arrayPresets(),
  validateInput: validateNumbers,
  complexity: {
    best: 'O(1) per push/pop',
    average: 'O(1) per push/pop',
    worst: 'O(1) per push/pop',
    space: 'O(n)',
    why: 'Only the top is accessed. Holding n values requires n storage slots.',
  },
  *generate(input) {
    const a: number[] = [],
      c = counters();
    yield frame(
      { kind: 'stack', values: a },
      'An empty stack is ready for its first value.',
      c,
      1,
      { top: -1 },
    );
    for (const value of input) {
      yield frame(
        { kind: 'stack', values: a },
        `Push ${value} onto the top.`,
        c,
        2,
        { value, top: a.length - 1 },
        [],
        {
          prompt: `Where does ${value} enter the stack?`,
          choices: ['Top', 'Bottom'],
          answer: 'Top',
          hint: 'A stack is last in, first out.',
        },
      );
      a.push(value);
      c.writes++;
      yield frame(
        { kind: 'stack', values: a },
        `${value} is now the top value.`,
        c,
        3,
        { top: a.length - 1 },
        [{ id: String(a.length - 1), kind: 'moving' }],
      );
    }
    while (a.length) {
      const expected = String(a[a.length - 1]);
      yield frame(
        { kind: 'stack', values: a },
        'The most recently pushed value leaves first.',
        c,
        4,
        { top: a.length - 1 },
        [{ id: String(a.length - 1), kind: 'comparing' }],
        {
          prompt: 'Which value will pop next?',
          choices: [...new Set(a.map(String))],
          answer: expected,
          hint: 'Look at the top of the stack.',
        },
      );
      const value = a.pop()!;
      c.reads++;
      c.writes++;
      yield frame(
        { kind: 'stack', values: a },
        `Pop ${value} from the stack.`,
        c,
        5,
        { popped: value, top: a.length - 1 },
      );
    }
    yield frame(
      { kind: 'stack', values: a, result: [] },
      'The stack is empty again.',
      c,
      6,
      { top: -1 },
    );
  },
};

export const stack = withLineMap(implementation, {
  python: { '1': 2, '2': 3, '3': 3 },
  java: { '1': 2, '2': 3, '3': 3 },
  cpp: { '1': 3, '2': 3, '3': 3 },
});
