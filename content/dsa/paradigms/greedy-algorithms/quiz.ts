const quiz = [
  {
    id: 'invariant',
    question: 'Which step matches the algorithm\u2019s invariant?',
    choices: [
      'For interval scheduling, sort by finish time.',
      'Reuse an item whenever a current-row value improves.',
      'Keep a backtracking choice when moving to every sibling branch.',
    ],
    answer: 0,
    explanation: 'Choose locally only when an exchange proof permits it.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible input is solved in constant time.',
      'O(n log n) time and O(n) teaching copy',
      'Animation duration is calibrated CPU time.',
    ],
    answer: 1,
    explanation: 'O(n log n) time and O(n) teaching copy',
  },
  {
    id: 'pitfall',
    question: 'Which limitation or boundary case matters?',
    choices: [
      'Fractional density greediness does not solve 0/1 knapsack. Weighted interval scheduling is also a different problem.',
      'A search budget ending proves unsatisfiability.',
      'A fractional-knapsack proof solves all indivisible-item problems.',
    ],
    answer: 0,
    explanation:
      'Fractional density greediness does not solve 0/1 knapsack. Weighted interval scheduling is also a different problem.',
  },
];
export default quiz;
