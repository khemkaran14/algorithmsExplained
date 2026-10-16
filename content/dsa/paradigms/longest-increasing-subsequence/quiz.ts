const quiz = [
  {
    id: 'invariant',
    question: 'Which step matches the algorithm\u2019s invariant?',
    choices: [
      'Binary-search the first tail at least as large as the incoming value.',
      'Reuse an item whenever a current-row value improves.',
      'Keep a backtracking choice when moving to every sibling branch.',
    ],
    answer: 0,
    explanation: 'Keep the smallest tail for each length.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible input is solved in constant time.',
      'O(n log n) time and O(n) space',
      'Animation duration is calibrated CPU time.',
    ],
    answer: 1,
    explanation: 'O(n log n) time and O(n) space',
  },
  {
    id: 'pitfall',
    question: 'Which limitation or boundary case matters?',
    choices: [
      'The tails array alone need not be a subsequence of the original input; predecessor links recover a valid one.',
      'A search budget ending proves unsatisfiability.',
      'A fractional-knapsack proof solves all indivisible-item problems.',
    ],
    answer: 0,
    explanation:
      'The tails array alone need not be a subsequence of the original input; predecessor links recover a valid one.',
  },
];
export default quiz;
