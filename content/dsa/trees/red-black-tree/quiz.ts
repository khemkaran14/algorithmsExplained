const quiz = [
  {
    id: 'invariant',
    question: 'Which step preserves this structure or query?',
    choices: [
      'Insert a red leaf.',
      'Treat every binary tree as sorted.',
      'Ignore the representation\u2019s index convention.',
    ],
    answer: 0,
    explanation:
      'This left-leaning red-black insertion model represents a 2\u20133 tree. At every committed insertion, the root is black, no red node has a red child, and all root-to-null paths contain the same number of black nodes.',
  },
  {
    id: 'cost',
    question: 'Which bound applies to the operation in this lesson?',
    choices: [
      'All possible operations are constant time.',
      'O(log n) insertion and lookup',
      'The number of animation frames is calibrated CPU time.',
    ],
    answer: 1,
    explanation:
      'This left-leaning red-black insertion model represents a 2\u20133 tree. At every committed insertion, the root is black, no red node has a red child, and all root-to-null paths contain the same number of black nodes.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters here?',
    choices: [
      'This lesson uses the LLRB variant. Ordinary red-black implementations can use different repair cases.',
      'Every binary search tree is automatically balanced.',
      'One tree traversal solves every arbitrary graph problem.',
    ],
    answer: 0,
    explanation:
      'This lesson uses the LLRB variant. Ordinary red-black implementations can use different repair cases.',
  },
];
export default quiz;
