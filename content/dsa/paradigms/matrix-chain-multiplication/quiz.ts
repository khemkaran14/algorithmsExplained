const quiz = [
  {
    id: 'invariant',
    question: 'Which step matches the algorithm\u2019s invariant?',
    choices: [
      'Set single-matrix cost to zero.',
      'Reuse an item whenever a current-row value improves.',
      'Keep a backtracking choice when moving to every sibling branch.',
    ],
    answer: 0,
    explanation: 'Choose the last split of an interval.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible input is solved in constant time.',
      'O(n\u00b3) time and O(n\u00b2) space',
      'Animation duration is calibrated CPU time.',
    ],
    answer: 1,
    explanation: 'O(n\u00b3) time and O(n\u00b2) space',
  },
  {
    id: 'pitfall',
    question: 'Which limitation or boundary case matters?',
    choices: [
      'Matrix order cannot change, and the dimension vector has one more entry than the matrix count.',
      'A search budget ending proves unsatisfiability.',
      'A fractional-knapsack proof solves all indivisible-item problems.',
    ],
    answer: 0,
    explanation:
      'Matrix order cannot change, and the dimension vector has one more entry than the matrix count.',
  },
];
export default quiz;
