const quiz = [
  {
    id: 'complexity',
    question: 'Which cost or quantity applies here?',
    choices: [
      'O(n log log n)',
      'O(1) for every possible unbounded workload',
      'The number of animations is a calibrated CPU time.',
    ],
    answer: 0,
    explanation:
      'The sieve uses O(n) memory and O(n log log n) marking work. Starting at p\u00b2 avoids redoing smaller multiples solely to rediscover them.',
  },
  {
    id: 'invariant',
    question: 'Which step preserves the intended result?',
    choices: [
      'Ignore edge conditions.',
      'Mark zero and one as nonprime.',
      'Always keep the first result regardless of later input.',
    ],
    answer: 1,
    explanation: 'Mark zero and one as nonprime.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation should you remember?',
    choices: [
      'A single-number test and a sieve solve different workloads. Zero and one are not prime, and p itself must not be crossed out.',
      'Every randomized result is cryptographically secure.',
      'A converged clustering must be globally optimal.',
    ],
    answer: 0,
    explanation:
      'A single-number test and a sieve solve different workloads. Zero and one are not prime, and p itself must not be crossed out.',
  },
];
export default quiz;
