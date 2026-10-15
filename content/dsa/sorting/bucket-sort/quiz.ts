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
      'With well-spread input the buckets stay small, while one crowded bucket can require O(n\u00b2) insertion work.',
  },
  {
    id: 'invariant',
    question: 'Which rule must the algorithm preserve?',
    choices: [
      'Discard duplicate keys.',
      'The worst case occurs when values crowd into one bucket.',
      'Stop after the first comparison.',
    ],
    answer: 1,
    explanation: 'The worst case occurs when values crowd into one bucket.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Every sort is stable.',
      'Uniform distribution is an assumption, not a guarantee. Clamp the maximum value into the final bucket.',
      'Animation duration is a reliable benchmark.',
    ],
    answer: 1,
    explanation:
      'Uniform distribution is an assumption, not a guarantee. Clamp the maximum value into the final bucket.',
  },
];
export default quiz;
