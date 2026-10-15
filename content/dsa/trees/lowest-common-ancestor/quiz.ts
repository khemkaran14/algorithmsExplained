const quiz = [
  {
    id: 'invariant',
    question: 'Which step preserves this structure or query?',
    choices: [
      'Compute depths from valid parent pointers.',
      'Treat every binary tree as sorted.',
      'Ignore the representation\u2019s index convention.',
    ],
    answer: 0,
    explanation:
      'The ancestor may equal either queried node. This parent-pointer teaching method is O(h), not a binary-lifting implementation. The root points to -1.',
  },
  {
    id: 'cost',
    question: 'Which bound applies to the operation in this lesson?',
    choices: [
      'All possible operations are constant time.',
      'O(h) single query; O(n) stored parent/depth data',
      'The number of animation frames is calibrated CPU time.',
    ],
    answer: 1,
    explanation:
      'The ancestor may equal either queried node. This parent-pointer teaching method is O(h), not a binary-lifting implementation. The root points to -1.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters here?',
    choices: [
      'A node is its own ancestor in this convention; do not move above root zero.',
      'Every binary search tree is automatically balanced.',
      'One tree traversal solves every arbitrary graph problem.',
    ],
    answer: 0,
    explanation:
      'A node is its own ancestor in this convention; do not move above root zero.',
  },
];
export default quiz;
