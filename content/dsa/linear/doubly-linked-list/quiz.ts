const quiz = [
  {
    id: 'complexity',
    question: 'Which bound or property applies to this demonstration?',
    choices: [
      'O(1) deletion of a known node',
      'Every operation is always O(n\u00b2).',
      'All storage is O(1), regardless of input.',
    ],
    answer: 0,
    explanation:
      'A known node can be removed in O(1), but locating it by key still costs O(n). Each node stores an extra previous link.',
  },
  {
    id: 'invariant',
    question: 'Which rule must be preserved?',
    choices: [
      'Ignore empty and full states.',
      'Store previous and next links.',
      'Treat equal values as the same node identity.',
    ],
    answer: 1,
    explanation: 'Store previous and next links.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Repair both neighbor links and the head/tail pointers. Forgetting one direction leaves a broken invariant.',
      'A pointer structure always has constant-time key lookup.',
      'A code point always equals one visible character.',
    ],
    answer: 0,
    explanation:
      'Repair both neighbor links and the head/tail pointers. Forgetting one direction leaves a broken invariant.',
  },
];
export default quiz;
