const quiz = [
  {
    id: 'invariant',
    question: 'Which step matches the algorithm\u2019s invariant?',
    choices: [
      'Process cells in row-major order.',
      'Reuse an item whenever a current-row value improves.',
      'Keep a backtracking choice when moving to every sibling branch.',
    ],
    answer: 0,
    explanation: 'A cell depends on its valid predecessors.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible input is solved in constant time.',
      'O(RC) time and O(RC) displayed space',
      'Animation duration is calibrated CPU time.',
    ],
    answer: 1,
    explanation: 'O(RC) time and O(RC) displayed space',
  },
  {
    id: 'pitfall',
    question: 'Which limitation or boundary case matters?',
    choices: [
      'Blocked endpoints are unreachable. Negative costs are allowed because right/down movement creates no cycles.',
      'A search budget ending proves unsatisfiability.',
      'A fractional-knapsack proof solves all indivisible-item problems.',
    ],
    answer: 0,
    explanation:
      'Blocked endpoints are unreachable. Negative costs are allowed because right/down movement creates no cycles.',
  },
];
export default quiz;
