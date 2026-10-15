const quiz = [
  {
    id: 'invariant',
    question: 'Which step preserves this structure or query?',
    choices: [
      'Build leaf values and internal sums.',
      'Treat every binary tree as sorted.',
      'Ignore the representation\u2019s index convention.',
    ],
    answer: 0,
    explanation:
      'The iterative sum tree pads to the next power of two. Only boundary paths need splitting during a range query. Empty half-open ranges return zero.',
  },
  {
    id: 'cost',
    question: 'Which bound applies to the operation in this lesson?',
    choices: [
      'All possible operations are constant time.',
      'O(log n) update/query; O(n) space',
      'The number of animation frames is calibrated CPU time.',
    ],
    answer: 1,
    explanation:
      'The iterative sum tree pads to the next power of two. Only boundary paths need splitting during a range query. Empty half-open ranges return zero.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters here?',
    choices: [
      'Use the aggregate\u2019s identity for padding and keep [left,right) boundaries consistent.',
      'Every binary search tree is automatically balanced.',
      'One tree traversal solves every arbitrary graph problem.',
    ],
    answer: 0,
    explanation:
      'Use the aggregate\u2019s identity for padding and keep [left,right) boundaries consistent.',
  },
];
export default quiz;
