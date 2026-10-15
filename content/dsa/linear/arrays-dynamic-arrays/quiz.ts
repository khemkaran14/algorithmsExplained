const quiz = [
  {
    id: 'complexity',
    question: 'Which bound or property applies to this demonstration?',
    choices: [
      'O(1) amortized append',
      'Every operation is always O(n\u00b2).',
      'All storage is O(1), regardless of input.',
    ],
    answer: 0,
    explanation:
      'One append can copy n values, but geometric resizing makes the total copying across n appends linear, giving O(1) amortized append.',
  },
  {
    id: 'invariant',
    question: 'Which rule must be preserved?',
    choices: [
      'Ignore empty and full states.',
      'Track logical length separately from allocated capacity.',
      'Treat equal values as the same node identity.',
    ],
    answer: 1,
    explanation: 'Track logical length separately from allocated capacity.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Amortized O(1) is not a worst-case guarantee for each append. Spare allocated slots are not logical elements.',
      'A pointer structure always has constant-time key lookup.',
      'A code point always equals one visible character.',
    ],
    answer: 0,
    explanation:
      'Amortized O(1) is not a worst-case guarantee for each append. Spare allocated slots are not logical elements.',
  },
];
export default quiz;
