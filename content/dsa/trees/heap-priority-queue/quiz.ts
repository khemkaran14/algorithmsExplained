const quiz = [
  {
    id: 'invariant',
    question: 'Which step preserves this structure or query?',
    choices: [
      'Append a new leaf.',
      'Treat every binary tree as sorted.',
      'Ignore the representation\u2019s index convention.',
    ],
    answer: 0,
    explanation:
      'A complete binary tree gives logarithmic height. The array stores children at 2i+1 and 2i+2. Repeated extraction returns descending order.',
  },
  {
    id: 'cost',
    question: 'Which bound applies to the operation in this lesson?',
    choices: [
      'All possible operations are constant time.',
      'O(log n) insertion/extraction; O(1) peek',
      'The number of animation frames is calibrated CPU time.',
    ],
    answer: 1,
    explanation:
      'A complete binary tree gives logarithmic height. The array stores children at 2i+1 and 2i+2. Repeated extraction returns descending order.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters here?',
    choices: [
      'A heap array is not a sorted array; only parent-child order is guaranteed.',
      'Every binary search tree is automatically balanced.',
      'One tree traversal solves every arbitrary graph problem.',
    ],
    answer: 0,
    explanation:
      'A heap array is not a sorted array; only parent-child order is guaranteed.',
  },
];
export default quiz;
