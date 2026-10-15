const quiz = [
  {
    id: 'complexity',
    question: 'What is the typical complexity of stack?',
    choices: ['O(1)', 'O(n\u00b3)', 'O(2\u207f)'],
    answer: 0,
    explanation: 'Push and pop touch only one end.',
  },
  {
    id: 'invariant',
    question: 'Which rule makes this lesson work?',
    choices: [
      'Push adds a value at the top.',
      'Always reverse the entire input.',
      'Ignore the input order and all boundaries.',
    ],
    answer: 0,
    explanation: 'Push adds a value at the top.',
  },
  {
    id: 'pitfall',
    question: 'Which warning should you remember?',
    choices: [
      'Every algorithm is constant time.',
      'Always check for an empty stack before a pop or peek.',
      'More memory always makes an algorithm linear.',
    ],
    answer: 1,
    explanation: 'Always check for an empty stack before a pop or peek.',
  },
];

export default quiz;
