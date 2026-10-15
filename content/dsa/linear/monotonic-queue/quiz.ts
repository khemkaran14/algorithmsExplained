const quiz = [
  {
    id: 'complexity',
    question: 'Which bound or property applies to this demonstration?',
    choices: [
      'O(n) whole pass',
      'Every operation is always O(n\u00b2).',
      'All storage is O(1), regardless of input.',
    ],
    answer: 0,
    explanation:
      'Every index enters once and leaves at most once. The logical deque uses O(k) window space; the JavaScript array model periodically compacts expired slots.',
  },
  {
    id: 'invariant',
    question: 'Which rule must be preserved?',
    choices: [
      'Ignore empty and full states.',
      'Expire indices that leave the sliding window.',
      'Treat equal values as the same node identity.',
    ],
    answer: 1,
    explanation: 'Expire indices that leave the sliding window.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Remove expired indices before reading the maximum. Values alone cannot identify when duplicate candidates expire.',
      'A pointer structure always has constant-time key lookup.',
      'A code point always equals one visible character.',
    ],
    answer: 0,
    explanation:
      'Remove expired indices before reading the maximum. Values alone cannot identify when duplicate candidates expire.',
  },
];
export default quiz;
