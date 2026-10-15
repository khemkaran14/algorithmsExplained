const quiz = [
  {
    id: 'complexity',
    question:
      'Which statement describes this lesson\u2019s cost or ordering property?',
    choices: [
      'Stable insertion sort',
      'All inputs always take constant time.',
      'The input never changes the work.',
    ],
    answer: 0,
    explanation:
      'Stability is an ordering property, not a time bound. This demonstration uses stable insertion sort, with O(n\u00b2) worst-case time.',
  },
  {
    id: 'invariant',
    question: 'Which rule must the algorithm preserve?',
    choices: [
      'Discard duplicate keys.',
      'Equal-key records retain their original order.',
      'Stop after the first comparison.',
    ],
    answer: 1,
    explanation: 'Equal-key records retain their original order.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Every sort is stable.',
      'Sorted numeric keys alone cannot prove stability; inspect the original-position labels on equal keys.',
      'Animation duration is a reliable benchmark.',
    ],
    answer: 1,
    explanation:
      'Sorted numeric keys alone cannot prove stability; inspect the original-position labels on equal keys.',
  },
];
export default quiz;
