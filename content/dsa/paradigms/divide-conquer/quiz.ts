const quiz = [
  {
    id: 'invariant',
    question: 'Which step matches the algorithm\u2019s invariant?',
    choices: [
      'Solve each half recursively.',
      'Reuse an item whenever a current-row value improves.',
      'Keep a backtracking choice when moving to every sibling branch.',
    ],
    answer: 0,
    explanation: 'Split, solve, then prove the combine step.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible input is solved in constant time.',
      'O(n log n) time and O(log n) call stack',
      'Animation duration is calibrated CPU time.',
    ],
    answer: 1,
    explanation: 'O(n log n) time and O(log n) call stack',
  },
  {
    id: 'pitfall',
    question: 'Which limitation or boundary case matters?',
    choices: [
      'The requested interval is nonempty, so an all-negative array cannot return an empty zero-sum answer.',
      'A search budget ending proves unsatisfiability.',
      'A fractional-knapsack proof solves all indivisible-item problems.',
    ],
    answer: 0,
    explanation:
      'The requested interval is nonempty, so an all-negative array cannot return an empty zero-sum answer.',
  },
];
export default quiz;
