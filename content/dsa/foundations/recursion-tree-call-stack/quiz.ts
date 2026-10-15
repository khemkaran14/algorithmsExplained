const quiz = [
  {
    id: 'complexity',
    question: 'Which statement describes the cost or invariant here?',
    choices: [
      'Exponential calls; linear active depth',
      'All input sizes have the same total work.',
      'Visualization frames are processor instructions.',
    ],
    answer: 0,
    explanation:
      'Naive Fibonacci repeats subproblems exponentially, while the active call stack has linear depth. Storing the entire educational call tree is additional visualization memory.',
  },
  {
    id: 'invariant',
    question: 'Which step is necessary?',
    choices: [
      'Ignore the data representation.',
      'Create a node for every naive Fibonacci call.',
      'Always discard the first item.',
    ],
    answer: 1,
    explanation: 'Create a node for every naive Fibonacci call.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'Do not confuse the number of tree nodes with active stack depth. This uncached demonstration is intentionally capped at n=8.',
      'All recursion needs constant stack space.',
      'All pointer strategies work on unsorted data.',
    ],
    answer: 0,
    explanation:
      'Do not confuse the number of tree nodes with active stack depth. This uncached demonstration is intentionally capped at n=8.',
  },
];
export default quiz;
