const quiz = [
  {
    id: 'complexity',
    question: 'Which cost or quantity applies here?',
    choices: [
      'O(1) expected access',
      'O(1) for every possible unbounded workload',
      'The number of animations is a calibrated CPU time.',
    ],
    answer: 0,
    explanation:
      'An insertion-ordered hash map or hash map plus doubly linked list gives expected O(1) access and O(k) capacity.',
  },
  {
    id: 'invariant',
    question: 'Which step preserves the intended result?',
    choices: [
      'Ignore edge conditions.',
      'Look up the requested key.',
      'Always keep the first result regardless of later input.',
    ],
    answer: 1,
    explanation: 'Look up the requested key.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation should you remember?',
    choices: [
      'A full scan to find the oldest key changes the access bound. Frequency and recency are different policies.',
      'Every randomized result is cryptographically secure.',
      'A converged clustering must be globally optimal.',
    ],
    answer: 0,
    explanation:
      'A full scan to find the oldest key changes the access bound. Frequency and recency are different policies.',
  },
];
export default quiz;
