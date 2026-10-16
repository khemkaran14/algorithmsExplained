const quiz = [
  {
    id: 'invariant',
    question: 'Which step matches the algorithm\u2019s invariant?',
    choices: [
      'Maintain a valid partial state.',
      'Reuse an item whenever a current-row value improves.',
      'Keep a backtracking choice when moving to every sibling branch.',
    ],
    answer: 0,
    explanation: 'Choose, test, recurse, undo.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible input is solved in constant time.',
      'Output/search dependent; exponential or factorial worst-case',
      'Animation duration is calibrated CPU time.',
    ],
    answer: 1,
    explanation: 'Output/search dependent; exponential or factorial worst-case',
  },
  {
    id: 'pitfall',
    question: 'Which limitation or boundary case matters?',
    choices: [
      'Pruning does not remove worst-case exponential work. A search budget ending does not prove unsatisfiability.',
      'A search budget ending proves unsatisfiability.',
      'A fractional-knapsack proof solves all indivisible-item problems.',
    ],
    answer: 0,
    explanation:
      'Pruning does not remove worst-case exponential work. A search budget ending does not prove unsatisfiability.',
  },
];
export default quiz;
