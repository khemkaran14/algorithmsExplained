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
      'Frequency buckets and a minimum-frequency pointer avoid scanning every key. Hash lookups and local bucket updates are expected O(1), using O(k) space.',
  },
  {
    id: 'invariant',
    question: 'Which step preserves the intended result?',
    choices: [
      'Ignore edge conditions.',
      'Track a frequency for each cached key.',
      'Always keep the first result regardless of later input.',
    ],
    answer: 1,
    explanation: 'Track a frequency for each cached key.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation should you remember?',
    choices: [
      'A frequency-only tie rule is incomplete. This model chooses LRU within a frequency bucket, and a newly loaded key starts at frequency one.',
      'Every randomized result is cryptographically secure.',
      'A converged clustering must be globally optimal.',
    ],
    answer: 0,
    explanation:
      'A frequency-only tie rule is incomplete. This model chooses LRU within a frequency bucket, and a newly loaded key starts at frequency one.',
  },
];
export default quiz;
