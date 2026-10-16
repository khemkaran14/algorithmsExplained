const quiz = [
  {
    id: 'invariant',
    question: 'Which step matches the algorithm\u2019s invariant?',
    choices: [
      'Compute children before their parent.',
      'Reuse an item whenever a current-row value improves.',
      'Keep a backtracking choice when moving to every sibling branch.',
    ],
    answer: 0,
    explanation: 'Keep both choices at every subtree root.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible input is solved in constant time.',
      'O(n) time and O(n) state',
      'Animation duration is calibrated CPU time.',
    ],
    answer: 1,
    explanation: 'O(n) time and O(n) state',
  },
  {
    id: 'pitfall',
    question: 'Which limitation or boundary case matters?',
    choices: [
      'A recurrence that ignores whether the parent is selected can combine incompatible choices.',
      'A search budget ending proves unsatisfiability.',
      'A fractional-knapsack proof solves all indivisible-item problems.',
    ],
    answer: 0,
    explanation:
      'A recurrence that ignores whether the parent is selected can combine incompatible choices.',
  },
];
export default quiz;
