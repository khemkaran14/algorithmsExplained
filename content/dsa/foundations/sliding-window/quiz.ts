const quiz = [
  {
    id: 'complexity',
    question: 'Which statement describes the cost or invariant here?',
    choices: [
      'O(n) whole pass',
      'All input sizes have the same total work.',
      'Visualization frames are processor instructions.',
    ],
    answer: 0,
    explanation:
      'Every value enters once and leaves at most once, giving O(n) time. Negative values are valid because the width is fixed.',
  },
  {
    id: 'invariant',
    question: 'Which step is necessary?',
    choices: [
      'Ignore the data representation.',
      'Add the incoming value.',
      'Always discard the first item.',
    ],
    answer: 1,
    explanation: 'Add the incoming value.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'Initialize the best sum for negative inputs correctly. A fixed-width sum problem is different from a window maximum-element problem.',
      'All recursion needs constant stack space.',
      'All pointer strategies work on unsorted data.',
    ],
    answer: 0,
    explanation:
      'Initialize the best sum for negative inputs correctly. A fixed-width sum problem is different from a window maximum-element problem.',
  },
];
export default quiz;
