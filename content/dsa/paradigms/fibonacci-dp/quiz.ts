const quiz = [
  {
    id: 'invariant',
    question: 'Which step matches the algorithm\u2019s invariant?',
    choices: [
      'Store F(0)=0 and F(1)=1.',
      'Reuse an item whenever a current-row value improves.',
      'Keep a backtracking choice when moving to every sibling branch.',
    ],
    answer: 0,
    explanation: 'Compute each index once.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible input is solved in constant time.',
      'O(n) additions; O(n) stored values',
      'Animation duration is calibrated CPU time.',
    ],
    answer: 1,
    explanation: 'O(n) additions; O(n) stored values',
  },
  {
    id: 'pitfall',
    question: 'Which limitation or boundary case matters?',
    choices: [
      'Arithmetic-operation counts omit growing big-integer operand cost. The result is an exact decimal string.',
      'A search budget ending proves unsatisfiability.',
      'A fractional-knapsack proof solves all indivisible-item problems.',
    ],
    answer: 0,
    explanation:
      'Arithmetic-operation counts omit growing big-integer operand cost. The result is an exact decimal string.',
  },
];
export default quiz;
