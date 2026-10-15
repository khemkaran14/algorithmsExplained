const quiz = [
  {
    id: 'complexity',
    question: 'Which statement describes the cost or invariant here?',
    choices: [
      'Compare O(n\u00b2)/O(1) with expected O(n)/O(n)',
      'All input sizes have the same total work.',
      'Visualization frames are processor instructions.',
    ],
    answer: 0,
    explanation:
      'The pair method is quadratic without an early duplicate. Hash-set lookup is expected constant time per key but uses linear extra memory.',
  },
  {
    id: 'invariant',
    question: 'Which step is necessary?',
    choices: [
      'Ignore the data representation.',
      'Try a constant-space scan of every pair.',
      'Always discard the first item.',
    ],
    answer: 1,
    explanation: 'Try a constant-space scan of every pair.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'Expected hash-table performance is not a universal worst-case guarantee. Extra memory must be counted separately from time.',
      'All recursion needs constant stack space.',
      'All pointer strategies work on unsorted data.',
    ],
    answer: 0,
    explanation:
      'Expected hash-table performance is not a universal worst-case guarantee. Extra memory must be counted separately from time.',
  },
];
export default quiz;
