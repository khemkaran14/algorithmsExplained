const quiz = [
  {
    id: 'invariant',
    question: 'Which step matches the algorithm\u2019s invariant?',
    choices: [
      'Define the zero-amount base.',
      'Reuse an item whenever a current-row value improves.',
      'Keep a backtracking choice when moving to every sibling branch.',
    ],
    answer: 0,
    explanation: 'Amount is the state; the question sets the recurrence.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible input is solved in constant time.',
      'O(kA) time and O(A) workspace',
      'Animation duration is calibrated CPU time.',
    ],
    answer: 1,
    explanation: 'O(kA) time and O(A) workspace',
  },
  {
    id: 'pitfall',
    question: 'Which limitation or boundary case matters?',
    choices: [
      'Minimum coin count and unordered combination count are different questions. An unreachable amount is not a zero-coin solution.',
      'A search budget ending proves unsatisfiability.',
      'A fractional-knapsack proof solves all indivisible-item problems.',
    ],
    answer: 0,
    explanation:
      'Minimum coin count and unordered combination count are different questions. An unreachable amount is not a zero-coin solution.',
  },
];
export default quiz;
