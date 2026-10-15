const quiz = [
  {
    id: 'complexity',
    question: 'Which cost description applies here?',
    choices: [
      'O(n) worst case',
      'O(1) for every input',
      'O(n!) for every input',
    ],
    answer: 0,
    explanation:
      'Uniformly distributed keys can give O(log log n) average behavior. Highly skewed distributions can degrade to O(n).',
  },
  {
    id: 'invariant',
    question: 'Which step is essential?',
    choices: [
      'Ignore array boundaries.',
      'Check whether the target lies inside the endpoint values.',
      'Sort by discarding duplicate keys.',
    ],
    answer: 1,
    explanation: 'Check whether the target lies inside the endpoint values.',
  },
  {
    id: 'pitfall',
    question: 'Which warning should you remember?',
    choices: [
      'A zero denominator and skewed distributions need explicit handling; the estimate must stay inside the active interval.',
      'Every target must be present.',
      'An animation frame is a processor cycle.',
    ],
    answer: 0,
    explanation:
      'A zero denominator and skewed distributions need explicit handling; the estimate must stay inside the active interval.',
  },
];
export default quiz;
