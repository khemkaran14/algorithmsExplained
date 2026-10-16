const quiz = [
  {
    id: 'invariant',
    question: 'Which step matches the algorithm\u2019s invariant?',
    choices: [
      'Initialize empty-prefix insertion and deletion costs.',
      'Reuse an item whenever a current-row value improves.',
      'Keep a backtracking choice when moving to every sibling branch.',
    ],
    answer: 0,
    explanation: 'Choose a final edit between prefixes.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible input is solved in constant time.',
      'O(mn) time and O(mn) reconstruction space',
      'Animation duration is calibrated CPU time.',
    ],
    answer: 1,
    explanation: 'O(mn) time and O(mn) reconstruction space',
  },
  {
    id: 'pitfall',
    question: 'Which limitation or boundary case matters?',
    choices: [
      'Transposition is not a one-step operation in this unit-cost Levenshtein model.',
      'A search budget ending proves unsatisfiability.',
      'A fractional-knapsack proof solves all indivisible-item problems.',
    ],
    answer: 0,
    explanation:
      'Transposition is not a one-step operation in this unit-cost Levenshtein model.',
  },
];
export default quiz;
