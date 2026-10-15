const quiz = [
  {
    id: 'complexity',
    question: 'Which cost or quantity applies here?',
    choices: [
      'O(log exponent) multiplications',
      'O(1) for every possible unbounded workload',
      'The number of animations is a calibrated CPU time.',
    ],
    answer: 0,
    explanation:
      'The algorithm uses O(log exponent) multiplications. Exact big integers are used, so the cost of each multiplication also grows with operand size.',
  },
  {
    id: 'invariant',
    question: 'Which step preserves the intended result?',
    choices: [
      'Ignore edge conditions.',
      'Start the accumulator at one.',
      'Always keep the first result regardless of later input.',
    ],
    answer: 1,
    explanation: 'Start the accumulator at one.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation should you remember?',
    choices: [
      'Do not use floating-point results when exact large integers are required. This integer routine uses the empty-product convention that exponent zero returns one.',
      'Every randomized result is cryptographically secure.',
      'A converged clustering must be globally optimal.',
    ],
    answer: 0,
    explanation:
      'Do not use floating-point results when exact large integers are required. This integer routine uses the empty-product convention that exponent zero returns one.',
  },
];
export default quiz;
