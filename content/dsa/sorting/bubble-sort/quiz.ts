const quiz = [
  {
    id: 'complexity',
    question: 'What is the typical complexity of bubble sort?',
    choices: ['O(n\u00b2)', 'O(n\u00b3)', 'O(2\u207f)'],
    answer: 0,
    explanation: 'Nested passes make the average and worst cases quadratic.',
  },
  {
    id: 'invariant',
    question: 'Which rule makes this lesson work?',
    choices: [
      'Compare neighboring values.',
      'Always reverse the entire input.',
      'Ignore the input order and all boundaries.',
    ],
    answer: 0,
    explanation: 'Compare neighboring values.',
  },
  {
    id: 'pitfall',
    question: 'Which warning should you remember?',
    choices: [
      'Every algorithm is constant time.',
      'Do not use it for large random arrays; quadratic comparisons dominate.',
      'More memory always makes an algorithm linear.',
    ],
    answer: 1,
    explanation:
      'Do not use it for large random arrays; quadratic comparisons dominate.',
  },
];

export default quiz;
