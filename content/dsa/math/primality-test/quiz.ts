const quiz = [
  {
    id: 'complexity',
    question: 'Which cost or quantity applies here?',
    choices: [
      'O(\u221an)',
      'O(1) for every possible unbounded workload',
      'The number of animations is a calibrated CPU time.',
    ],
    answer: 0,
    explanation:
      'Trial division needs O(\u221an) divisions in the worst case and constant auxiliary space. This is an exact small-integer teaching method, not a large cryptographic primality tester.',
  },
  {
    id: 'invariant',
    question: 'Which step preserves the intended result?',
    choices: [
      'Ignore edge conditions.',
      'Reject numbers below two.',
      'Always keep the first result regardless of later input.',
    ],
    answer: 1,
    explanation: 'Reject numbers below two.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation should you remember?',
    choices: [
      'Do not test all the way to n, do not call one prime, and avoid overflowing divisor*divisor in a general fixed-width implementation.',
      'Every randomized result is cryptographically secure.',
      'A converged clustering must be globally optimal.',
    ],
    answer: 0,
    explanation:
      'Do not test all the way to n, do not call one prime, and avoid overflowing divisor*divisor in a general fixed-width implementation.',
  },
];
export default quiz;
