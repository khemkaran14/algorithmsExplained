const quiz = [
  {
    id: 'invariant',
    question: 'Which step matches the algorithm\u2019s invariant?',
    choices: [
      'Index the state by item prefix and capacity.',
      'Reuse an item whenever a current-row value improves.',
      'Keep a backtracking choice when moving to every sibling branch.',
    ],
    answer: 0,
    explanation: 'Take it once or leave it.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible input is solved in constant time.',
      'O(nW) pseudo-polynomial time and O(nW) table',
      'Animation duration is calibrated CPU time.',
    ],
    answer: 1,
    explanation: 'O(nW) pseudo-polynomial time and O(nW) table',
  },
  {
    id: 'pitfall',
    question: 'Which limitation or boundary case matters?',
    choices: [
      'Density greediness is not correct for 0/1 knapsack, and using the current row can accidentally permit repeated items.',
      'A search budget ending proves unsatisfiability.',
      'A fractional-knapsack proof solves all indivisible-item problems.',
    ],
    answer: 0,
    explanation:
      'Density greediness is not correct for 0/1 knapsack, and using the current row can accidentally permit repeated items.',
  },
];
export default quiz;
