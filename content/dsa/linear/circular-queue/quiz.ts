const quiz = [
  {
    id: 'complexity',
    question: 'Which bound or property applies to this demonstration?',
    choices: [
      'O(1) enqueue/dequeue',
      'Every operation is always O(n\u00b2).',
      'All storage is O(1), regardless of input.',
    ],
    answer: 0,
    explanation:
      'Enqueue and dequeue are O(1); the reserved buffer uses O(k) capacity. This demonstration dequeues when full so wraparound becomes visible.',
  },
  {
    id: 'invariant',
    question: 'Which rule must be preserved?',
    choices: [
      'Ignore empty and full states.',
      'Track head, tail and size.',
      'Treat equal values as the same node identity.',
    ],
    answer: 1,
    explanation: 'Track head, tail and size.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Head equal to tail is ambiguous without a size or extra-slot convention. Never silently overwrite unread data unless overwrite behavior is part of the design.',
      'A pointer structure always has constant-time key lookup.',
      'A code point always equals one visible character.',
    ],
    answer: 0,
    explanation:
      'Head equal to tail is ambiguous without a size or extra-slot convention. Never silently overwrite unread data unless overwrite behavior is part of the design.',
  },
];
export default quiz;
