const quiz = [
  {
    id: 'complexity',
    question: 'Which cost description applies here?',
    choices: ['O(log n)', 'O(1) for every input', 'O(n!) for every input'],
    answer: 0,
    explanation:
      'Ternary search on a sorted array is O(log n), but its extra comparisons usually offer no advantage over binary search. This differs from ternary optimization on unimodal functions.',
  },
  {
    id: 'invariant',
    question: 'Which step is essential?',
    choices: [
      'Ignore array boundaries.',
      'Choose two third-points inside the interval.',
      'Sort by discarding duplicate keys.',
    ],
    answer: 1,
    explanation: 'Choose two third-points inside the interval.',
  },
  {
    id: 'pitfall',
    question: 'Which warning should you remember?',
    choices: [
      'Do not mix sorted-array lookup with unimodal continuous optimization; they use different invariants and stopping rules.',
      'Every target must be present.',
      'An animation frame is a processor cycle.',
    ],
    answer: 0,
    explanation:
      'Do not mix sorted-array lookup with unimodal continuous optimization; they use different invariants and stopping rules.',
  },
];
export default quiz;
