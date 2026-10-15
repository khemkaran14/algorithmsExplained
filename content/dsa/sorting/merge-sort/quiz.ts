const quiz = [
  {
    id: 'complexity',
    question: 'What is merge sort\u2019s worst-case time complexity?',
    choices: ['O(n)', 'O(n log n)', 'O(n\u00b2)'],
    answer: 1,
    explanation: 'Each of log\u2082 n levels performs linear merging work.',
  },
  {
    id: 'stability',
    question: 'When two candidates are equal, which should be chosen first?',
    choices: [
      'The right half',
      'Either half is always stable',
      'The left half',
    ],
    answer: 2,
    explanation: 'The left copy appeared earlier in the original array.',
  },
  {
    id: 'space',
    question: 'How much auxiliary storage does this array implementation need?',
    choices: ['O(n)', 'O(1)', 'O(n\u00b2)'],
    answer: 0,
    explanation:
      'Temporary arrays across active recursion levels total O(n) space.',
  },
];
export default quiz;
