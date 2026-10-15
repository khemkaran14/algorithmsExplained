const quiz = [
  {
    id: 'complexity',
    question: 'What is the typical complexity of breadth-first search?',
    choices: ['O(V + E)', 'O(n\u00b3)', 'O(2\u207f)'],
    answer: 0,
    explanation: 'Each reachable vertex and adjacency edge is processed once.',
  },
  {
    id: 'invariant',
    question: 'Which rule makes this lesson work?',
    choices: [
      'Enqueue the start node and mark it discovered.',
      'Always reverse the entire input.',
      'Ignore the input order and all boundaries.',
    ],
    answer: 0,
    explanation: 'Enqueue the start node and mark it discovered.',
  },
  {
    id: 'pitfall',
    question: 'Which warning should you remember?',
    choices: [
      'Every algorithm is constant time.',
      'Mark discovered nodes when enqueuing, not when dequeuing, to avoid duplicates.',
      'More memory always makes an algorithm linear.',
    ],
    answer: 1,
    explanation:
      'Mark discovered nodes when enqueuing, not when dequeuing, to avoid duplicates.',
  },
];

export default quiz;
