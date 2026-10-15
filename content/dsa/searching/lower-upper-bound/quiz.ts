const quiz = [
  {
    id: 'complexity',
    question: 'Which cost description applies here?',
    choices: ['O(log n)', 'O(1) for every input', 'O(n!) for every input'],
    answer: 0,
    explanation:
      'Both searches halve the interval, giving O(log n) total time and constant auxiliary space.',
  },
  {
    id: 'invariant',
    question: 'Which step is essential?',
    choices: [
      'Ignore array boundaries.',
      'Use a half-open interval [low, high).',
      'Sort by discarding duplicate keys.',
    ],
    answer: 1,
    explanation: 'Use a half-open interval [low, high).',
  },
  {
    id: 'pitfall',
    question: 'Which warning should you remember?',
    choices: [
      'The upper boundary can equal n. Never index it without checking; lower and upper predicates differ by equality.',
      'Every target must be present.',
      'An animation frame is a processor cycle.',
    ],
    answer: 0,
    explanation:
      'The upper boundary can equal n. Never index it without checking; lower and upper predicates differ by equality.',
  },
];
export default quiz;
