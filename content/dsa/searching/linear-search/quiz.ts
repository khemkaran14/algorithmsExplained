const quiz = [
  {
    id: 'complexity',
    question: 'Which cost description applies here?',
    choices: ['O(n)', 'O(1) for every input', 'O(n!) for every input'],
    answer: 0,
    explanation:
      'The best case is a first-position match. An absent target needs n comparisons, so average and worst cases are linear.',
  },
  {
    id: 'invariant',
    question: 'Which step is essential?',
    choices: [
      'Ignore array boundaries.',
      'Inspect the next value.',
      'Sort by discarding duplicate keys.',
    ],
    answer: 1,
    explanation: 'Inspect the next value.',
  },
  {
    id: 'pitfall',
    question: 'Which warning should you remember?',
    choices: [
      'Do not claim logarithmic time without a sorted-search invariant. This implementation returns the first matching index.',
      'Every target must be present.',
      'An animation frame is a processor cycle.',
    ],
    answer: 0,
    explanation:
      'Do not claim logarithmic time without a sorted-search invariant. This implementation returns the first matching index.',
  },
];
export default quiz;
