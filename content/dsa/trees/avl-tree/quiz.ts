const quiz = [
  {
    id: 'invariant',
    question: 'Which step preserves this structure or query?',
    choices: [
      'Insert using BST ordering.',
      'Treat every binary tree as sorted.',
      'Ignore the representation\u2019s index convention.',
    ],
    answer: 0,
    explanation:
      'Every committed AVL node has left and right heights differing by at most one. Single and double rotations preserve inorder key order. The interactive operation here is insertion.',
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
      'Every committed AVL node has left and right heights differing by at most one. Single and double rotations preserve inorder key order. The interactive operation here is insertion.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters here?',
    choices: [
      'Update the lower rotated node\u2019s height before its new parent.',
      'Every binary search tree is automatically balanced.',
      'One tree traversal solves every arbitrary graph problem.',
    ],
    answer: 0,
    explanation:
      'Update the lower rotated node\u2019s height before its new parent.',
  },
];
export default quiz;
