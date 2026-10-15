const quiz = [
  {
    id: 'complexity',
    question: 'Which bound or property applies to this demonstration?',
    choices: [
      'O(n) search',
      'Every operation is always O(n\u00b2).',
      'All storage is O(1), regardless of input.',
    ],
    answer: 0,
    explanation:
      'A tail pointer supports O(1) append. A key search can visit every node once, so it is O(n).',
  },
  {
    id: 'invariant',
    question: 'Which rule must be preserved?',
    choices: [
      'Ignore empty and full states.',
      'Keep a tail whose next link points to head.',
      'Treat equal values as the same node identity.',
    ],
    answer: 1,
    explanation: 'Keep a tail whose next link points to head.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'A traversal that waits for null will never stop in a nonempty circle. The single remaining node points to itself.',
      'A pointer structure always has constant-time key lookup.',
      'A code point always equals one visible character.',
    ],
    answer: 0,
    explanation:
      'A traversal that waits for null will never stop in a nonempty circle. The single remaining node points to itself.',
  },
];
export default quiz;
