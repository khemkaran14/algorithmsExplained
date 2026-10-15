const quiz = [
  {
    id: 'invariant',
    question: 'Which step preserves this structure or query?',
    choices: [
      'Insert by separator intervals.',
      'Treat every binary tree as sorted.',
      'Ignore the representation\u2019s index convention.',
    ],
    answer: 0,
    explanation:
      'This order-four insertion model allows at most three keys per page. B-tree internal keys are data; B+ internal separators are routing copies, and equality follows the right child. Leaf links support ordered scans.',
  },
  {
    id: 'cost',
    question: 'Which bound applies to the operation in this lesson?',
    choices: [
      'All possible operations are constant time.',
      'O(log_b n) page visits; O(n) storage',
      'The number of animation frames is calibrated CPU time.',
    ],
    answer: 1,
    explanation:
      'This order-four insertion model allows at most three keys per page. B-tree internal keys are data; B+ internal separators are routing copies, and equality follows the right child. Leaf links support ordered scans.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters here?',
    choices: [
      'A B+ internal separator match is not a data hit; continue to its leaf. This lesson demonstrates insertion and lookup, not deletion rebalancing.',
      'Every binary search tree is automatically balanced.',
      'One tree traversal solves every arbitrary graph problem.',
    ],
    answer: 0,
    explanation:
      'A B+ internal separator match is not a data hit; continue to its leaf. This lesson demonstrates insertion and lookup, not deletion rebalancing.',
  },
];
export default quiz;
