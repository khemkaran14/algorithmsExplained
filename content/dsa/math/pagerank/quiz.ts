const quiz = [
  {
    id: 'complexity',
    question: 'Which cost or quantity applies here?',
    choices: [
      'O(I(V+E))',
      'O(1) for every possible unbounded workload',
      'The number of animations is a calibrated CPU time.',
    ],
    answer: 0,
    explanation:
      'I sparse power iterations cost O(I(V+E)) time and O(V+E) space. Damping below one helps the random-surfer distribution converge.',
  },
  {
    id: 'invariant',
    question: 'Which step preserves the intended result?',
    choices: [
      'Ignore edge conditions.',
      'Start with uniform probability.',
      'Always keep the first result regardless of later input.',
    ],
    answer: 1,
    explanation: 'Start with uniform probability.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation should you remember?',
    choices: [
      'Dangling rank must be redistributed instead of deleted. Rank is a network statistic, not a measure of factual truth or personal worth.',
      'Every randomized result is cryptographically secure.',
      'A converged clustering must be globally optimal.',
    ],
    answer: 0,
    explanation:
      'Dangling rank must be redistributed instead of deleted. Rank is a network statistic, not a measure of factual truth or personal worth.',
  },
];
export default quiz;
