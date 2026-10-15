const quiz = [
  {
    id: 'complexity',
    question: 'Which statement describes the cost or invariant here?',
    choices: [
      'Compare k with log_b(a)',
      'All input sizes have the same total work.',
      'Visualization frames are processor instructions.',
    ],
    answer: 0,
    explanation:
      'For polynomial f(n)=n^k, compare k with log_b(a). Smaller k gives leaf-dominated work; equality adds a logarithmic factor; larger k gives root-dominated work and satisfies the polynomial regularity condition.',
  },
  {
    id: 'invariant',
    question: 'Which step is necessary?',
    choices: [
      'Ignore the data representation.',
      'Describe T(n)=aT(n/b)+n^k with a valid power-of-b input.',
      'Always discard the first item.',
    ],
    answer: 1,
    explanation: 'Describe T(n)=aT(n/b)+n^k with a valid power-of-b input.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'It does not automatically apply to unequal subproblem sizes, nonpolynomial f(n), or missing regularity conditions. The preset labels are theorem cases, not input orderings.',
      'All recursion needs constant stack space.',
      'All pointer strategies work on unsorted data.',
    ],
    answer: 0,
    explanation:
      'It does not automatically apply to unequal subproblem sizes, nonpolynomial f(n), or missing regularity conditions. The preset labels are theorem cases, not input orderings.',
  },
];
export default quiz;
