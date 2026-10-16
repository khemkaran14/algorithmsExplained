const quiz = [
  {
    id: 'invariant',
    question: 'Which step matches the algorithm\u2019s invariant?',
    choices: [
      'Define dp[i] as the minimum cost to land on step i.',
      'Reuse an item whenever a current-row value improves.',
      'Keep a backtracking choice when moving to every sibling branch.',
    ],
    answer: 0,
    explanation: 'Name a subproblem. Store its answer.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible input is solved in constant time.',
      'O(n) time; O(n) displayed table',
      'Animation duration is calibrated CPU time.',
    ],
    answer: 1,
    explanation: 'O(n) time; O(n) displayed table',
  },
  {
    id: 'pitfall',
    question: 'Which limitation or boundary case matters?',
    choices: [
      'The starting convention allows entry at stair zero or one; it matters for the base cases.',
      'A search budget ending proves unsatisfiability.',
      'A fractional-knapsack proof solves all indivisible-item problems.',
    ],
    answer: 0,
    explanation:
      'The starting convention allows entry at stair zero or one; it matters for the base cases.',
  },
];
export default quiz;
