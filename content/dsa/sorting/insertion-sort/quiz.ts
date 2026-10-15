const quiz = [
  {
    id: 'complexity',
    question:
      'Which statement describes this lesson\u2019s cost or ordering property?',
    choices: [
      'O(n\u00b2)',
      'All inputs always take constant time.',
      'The input never changes the work.',
    ],
    answer: 0,
    explanation:
      'A sorted prefix needs one comparison per insertion. Reverse order can shift all earlier keys, giving quadratic work.',
  },
  {
    id: 'invariant',
    question: 'Which rule must the algorithm preserve?',
    choices: [
      'Discard duplicate keys.',
      'Move only keys larger than the held key.',
      'Stop after the first comparison.',
    ],
    answer: 1,
    explanation: 'Move only keys larger than the held key.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Every sort is stable.',
      'Shift only strictly larger keys to preserve stability; do not lose the held key.',
      'Animation duration is a reliable benchmark.',
    ],
    answer: 1,
    explanation:
      'Shift only strictly larger keys to preserve stability; do not lose the held key.',
  },
];
export default quiz;
