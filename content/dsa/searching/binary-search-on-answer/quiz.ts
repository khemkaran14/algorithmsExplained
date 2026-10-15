const quiz = [
  {
    id: 'complexity',
    question: 'Which cost description applies here?',
    choices: ['O(n log S)', 'O(1) for every input', 'O(n!) for every input'],
    answer: 0,
    explanation:
      'A monotone feasibility predicate lets binary search find the minimum capacity. Each candidate scans n weights; the total is O(n log S) for capacity range S.',
  },
  {
    id: 'invariant',
    question: 'Which step is essential?',
    choices: [
      'Ignore array boundaries.',
      'Bound capacity between the largest weight and the total weight.',
      'Sort by discarding duplicate keys.',
    ],
    answer: 1,
    explanation:
      'Bound capacity between the largest weight and the total weight.',
  },
  {
    id: 'pitfall',
    question: 'Which warning should you remember?',
    choices: [
      'Nonnegative weights and contiguity are essential here. Feasibility uses at most the allowed number of groups, not exactly that many nonempty groups in the greedy check.',
      'Every target must be present.',
      'An animation frame is a processor cycle.',
    ],
    answer: 0,
    explanation:
      'Nonnegative weights and contiguity are essential here. Feasibility uses at most the allowed number of groups, not exactly that many nonempty groups in the greedy check.',
  },
];
export default quiz;
