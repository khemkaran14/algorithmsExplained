const quiz = [
  {
    id: 'complexity',
    question: 'Which statement describes the cost or invariant here?',
    choices: [
      'O(1) fixed-width mask operation',
      'All input sizes have the same total work.',
      'Visualization frames are processor instructions.',
    ],
    answer: 0,
    explanation:
      'Fixed-width machine-word masks take constant time in the word-RAM model. Arbitrary-precision numbers require accounting for their bit length.',
  },
  {
    id: 'invariant',
    question: 'Which step is necessary?',
    choices: [
      'Ignore the data representation.',
      'Build the mask 1 shifted by the bit index.',
      'Always discard the first item.',
    ],
    answer: 1,
    explanation: 'Build the mask 1 shifted by the bit index.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'JavaScript bit operators coerce to signed 32-bit values; arbitrary shifts and arbitrary-precision integers need separate handling. This view is limited to unsigned bytes.',
      'All recursion needs constant stack space.',
      'All pointer strategies work on unsorted data.',
    ],
    answer: 0,
    explanation:
      'JavaScript bit operators coerce to signed 32-bit values; arbitrary shifts and arbitrary-precision integers need separate handling. This view is limited to unsigned bytes.',
  },
];
export default quiz;
