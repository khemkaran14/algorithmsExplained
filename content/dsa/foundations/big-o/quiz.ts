const quiz = [
  {
    id: 'complexity',
    question: 'What is the time complexity of the single-pass sum shown here?',
    choices: ['O(n)', 'O(n\u00b3)', 'O(2\u207f)'],
    answer: 0,
    explanation: 'A single pass takes linear time.',
  },
  {
    id: 'invariant',
    question: 'Which rule makes this lesson work?',
    choices: [
      'Visit each input once.',
      'Always reverse the entire input.',
      'Ignore the input order and all boundaries.',
    ],
    answer: 0,
    explanation: 'Visit each input once.',
  },
  {
    id: 'pitfall',
    question: 'Which warning should you remember?',
    choices: [
      'Every algorithm is constant time.',
      'Big-O ignores constants; it does not predict exact milliseconds.',
      'More memory always makes an algorithm linear.',
    ],
    answer: 1,
    explanation:
      'Big-O ignores constants; it does not predict exact milliseconds.',
  },
];

export default quiz;
