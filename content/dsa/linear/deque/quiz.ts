const quiz = [
  {
    id: 'complexity',
    question: 'Which bound or property applies to this demonstration?',
    choices: [
      'O(1) linked end operation',
      'Every operation is always O(n\u00b2).',
      'All storage is O(1), regardless of input.',
    ],
    answer: 0,
    explanation:
      'A doubly linked implementation performs each end operation in O(1) time and stores O(n) nodes.',
  },
  {
    id: 'invariant',
    question: 'Which rule must be preserved?',
    choices: [
      'Ignore empty and full states.',
      'Keep both head and tail links.',
      'Treat equal values as the same node identity.',
    ],
    answer: 1,
    explanation: 'Keep both head and tail links.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'An array-backed front insertion may be linear. The implementation choice must support the claimed end-operation bounds.',
      'A pointer structure always has constant-time key lookup.',
      'A code point always equals one visible character.',
    ],
    answer: 0,
    explanation:
      'An array-backed front insertion may be linear. The implementation choice must support the claimed end-operation bounds.',
  },
];
export default quiz;
