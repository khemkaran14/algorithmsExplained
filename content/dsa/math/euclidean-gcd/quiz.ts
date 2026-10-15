const quiz = [
  {
    id: 'complexity',
    question: 'Which cost or quantity applies here?',
    choices: [
      'O(log min(a,b))',
      'O(1) for every possible unbounded workload',
      'The number of animations is a calibrated CPU time.',
    ],
    answer: 0,
    explanation:
      'Each Euclidean remainder reduces the positive operands quickly; consecutive Fibonacci numbers give the long-run logarithmic bound. The algorithm convention here returns zero for gcd(0,0).',
  },
  {
    id: 'invariant',
    question: 'Which step preserves the intended result?',
    choices: [
      'Ignore edge conditions.',
      'Compute a mod b.',
      'Always keep the first result regardless of later input.',
    ],
    answer: 1,
    explanation: 'Compute a mod b.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation should you remember?',
    choices: [
      'Avoid division by zero by testing b first. The demonstration accepts nonnegative integers; signed minimum values need care when taking absolute values.',
      'Every randomized result is cryptographically secure.',
      'A converged clustering must be globally optimal.',
    ],
    answer: 0,
    explanation:
      'Avoid division by zero by testing b first. The demonstration accepts nonnegative integers; signed minimum values need care when taking absolute values.',
  },
];
export default quiz;
