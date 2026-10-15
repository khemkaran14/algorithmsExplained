const quiz = [
  {
    id: 'complexity',
    question: 'Which cost or quantity applies here?',
    choices: [
      'O(n) time, O(k) space',
      'O(1) for every possible unbounded workload',
      'The number of animations is a calibrated CPU time.',
    ],
    answer: 0,
    explanation:
      'One pass takes O(n) time and O(k) space. At step i, the new item enters with probability k/(i+1), preserving every item\u2019s equal inclusion probability.',
  },
  {
    id: 'invariant',
    question: 'Which step preserves the intended result?',
    choices: [
      'Ignore edge conditions.',
      'Fill the first k slots.',
      'Always keep the first result regardless of later input.',
    ],
    answer: 1,
    explanation: 'Fill the first k slots.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation should you remember?',
    choices: [
      'Sampling positions is different from deduplicating equal values. The seeded generator is reproducible for teaching, not cryptographically secure randomness.',
      'Every randomized result is cryptographically secure.',
      'A converged clustering must be globally optimal.',
    ],
    answer: 0,
    explanation:
      'Sampling positions is different from deduplicating equal values. The seeded generator is reproducible for teaching, not cryptographically secure randomness.',
  },
];
export default quiz;
