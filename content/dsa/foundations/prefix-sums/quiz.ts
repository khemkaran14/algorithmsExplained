const quiz = [
  {
    id: 'complexity',
    question: 'Which statement describes the cost or invariant here?',
    choices: [
      'O(n) build; O(1) range query',
      'All input sizes have the same total work.',
      'Visualization frames are processor instructions.',
    ],
    answer: 0,
    explanation:
      'A linear preprocessing pass and O(n) storage support constant-time range-sum queries. Empty ranges and ranges starting at zero use the same formula.',
  },
  {
    id: 'invariant',
    question: 'Which step is necessary?',
    choices: [
      'Ignore the data representation.',
      'Store zero before the first value.',
      'Always discard the first item.',
    ],
    answer: 1,
    explanation: 'Store zero before the first value.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'Prefix indices count elements before a boundary. Inclusive/exclusive endpoint confusion causes off-by-one errors; changing inputs invalidates the precomputed sums.',
      'All recursion needs constant stack space.',
      'All pointer strategies work on unsorted data.',
    ],
    answer: 0,
    explanation:
      'Prefix indices count elements before a boundary. Inclusive/exclusive endpoint confusion causes off-by-one errors; changing inputs invalidates the precomputed sums.',
  },
];
export default quiz;
