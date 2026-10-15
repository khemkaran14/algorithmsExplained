const quiz = [
  {
    id: 'complexity',
    question: 'Which bound or property applies to this demonstration?',
    choices: [
      'O(1) linked enqueue/dequeue',
      'Every operation is always O(n\u00b2).',
      'All storage is O(1), regardless of input.',
    ],
    answer: 0,
    explanation:
      'A linked implementation with head and tail changes a constant number of links per enqueue or dequeue.',
  },
  {
    id: 'invariant',
    question: 'Which rule must be preserved?',
    choices: [
      'Ignore empty and full states.',
      'Enqueue at the tail.',
      'Treat equal values as the same node identity.',
    ],
    answer: 1,
    explanation: 'Enqueue at the tail.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Using an array operation that shifts every remaining value can turn a nominal dequeue into O(n) work.',
      'A pointer structure always has constant-time key lookup.',
      'A code point always equals one visible character.',
    ],
    answer: 0,
    explanation:
      'Using an array operation that shifts every remaining value can turn a nominal dequeue into O(n) work.',
  },
];
export default quiz;
