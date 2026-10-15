const quiz = [
  {
    id: 'complexity',
    question: 'Which bound or property applies to this demonstration?',
    choices: [
      'O(n) amortized whole pass',
      'Every operation is always O(n\u00b2).',
      'All storage is O(1), regardless of input.',
    ],
    answer: 0,
    explanation:
      'Each index is pushed once and popped at most once, so the whole pass is O(n), even if one value triggers many pops.',
  },
  {
    id: 'invariant',
    question: 'Which rule must be preserved?',
    choices: [
      'Ignore empty and full states.',
      'Store unresolved indices in nonincreasing value order.',
      'Treat equal values as the same node identity.',
    ],
    answer: 1,
    explanation: 'Store unresolved indices in nonincreasing value order.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Equal values do not satisfy a strictly greater query. Store indices to distinguish duplicates; an empty answer is different from a valid numeric value such as -1.',
      'A pointer structure always has constant-time key lookup.',
      'A code point always equals one visible character.',
    ],
    answer: 0,
    explanation:
      'Equal values do not satisfy a strictly greater query. Store indices to distinguish duplicates; an empty answer is different from a valid numeric value such as -1.',
  },
];
export default quiz;
