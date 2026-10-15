const quiz = [
  {
    id: 'complexity',
    question: 'Which cost or quantity applies here?',
    choices: [
      'O(I\u00b7n\u00b7k\u00b7d)',
      'O(1) for every possible unbounded workload',
      'The number of animations is a calibrated CPU time.',
    ],
    answer: 0,
    explanation:
      'Lloyd iterations cost O(I\u00b7n\u00b7k\u00b7d). Squared error does not increase after a complete assignment/mean update, but different initialization can produce different local optima.',
  },
  {
    id: 'invariant',
    question: 'Which step preserves the intended result?',
    choices: [
      'Ignore edge conditions.',
      'Initialize centers with a reproducible farthest-first heuristic.',
      'Always keep the first result regardless of later input.',
    ],
    answer: 1,
    explanation:
      'Initialize centers with a reproducible farthest-first heuristic.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation should you remember?',
    choices: [
      'Choose k deliberately, scale features appropriately, and do not interpret local convergence as a global optimum. An empty cluster retains its previous center in this model.',
      'Every randomized result is cryptographically secure.',
      'A converged clustering must be globally optimal.',
    ],
    answer: 0,
    explanation:
      'Choose k deliberately, scale features appropriately, and do not interpret local convergence as a global optimum. An empty cluster retains its previous center in this model.',
  },
];
export default quiz;
