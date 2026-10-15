const quiz = [
  {
    id: 'complexity',
    question: 'Which statement describes the cost or invariant here?',
    choices: [
      'O(n) time and O(1) extra space',
      'All input sizes have the same total work.',
      'Visualization frames are processor instructions.',
    ],
    answer: 0,
    explanation:
      'Each endpoint moves in one direction and crosses at most n positions, so a failed search is linear with constant auxiliary space.',
  },
  {
    id: 'invariant',
    question: 'Which step is necessary?',
    choices: [
      'Ignore the data representation.',
      'Start at both ends of an ascending array.',
      'Always discard the first item.',
    ],
    answer: 1,
    explanation: 'Start at both ends of an ascending array.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'Sorted order is essential for this sum argument, and one position cannot be used twice.',
      'All recursion needs constant stack space.',
      'All pointer strategies work on unsorted data.',
    ],
    answer: 0,
    explanation:
      'Sorted order is essential for this sum argument, and one position cannot be used twice.',
  },
];
export default quiz;
