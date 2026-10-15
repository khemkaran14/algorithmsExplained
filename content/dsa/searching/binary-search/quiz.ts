const quiz = [
  {
    id: 'complexity',
    question: 'What is the typical complexity of binary search?',
    choices: ['O(log n)', 'O(n\u00b3)', 'O(2\u207f)'],
    answer: 0,
    explanation: 'Every comparison halves the remaining interval.',
  },
  {
    id: 'invariant',
    question: 'Which rule makes this lesson work?',
    choices: [
      'Start with sorted values.',
      'Always reverse the entire input.',
      'Ignore the input order and all boundaries.',
    ],
    answer: 0,
    explanation: 'Start with sorted values.',
  },
  {
    id: 'pitfall',
    question: 'Which warning should you remember?',
    choices: [
      'Every algorithm is constant time.',
      'An unsorted input breaks the invariant; off-by-one boundaries cause missed values.',
      'More memory always makes an algorithm linear.',
    ],
    answer: 1,
    explanation:
      'An unsorted input breaks the invariant; off-by-one boundaries cause missed values.',
  },
];

export default quiz;
