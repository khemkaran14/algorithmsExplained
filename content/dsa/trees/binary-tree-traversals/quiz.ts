const quiz = [
  {
    id: 'invariant',
    question: 'Which step preserves this structure or query?',
    choices: [
      'Treat the array as complete-tree level order.',
      'Treat every binary tree as sorted.',
      'Ignore the representation\u2019s index convention.',
    ],
    answer: 0,
    explanation:
      'Traversal order changes the output without changing the tree. The input is a complete binary tree, not an implicit BST; inorder is sorted only if the tree already satisfies BST ordering.',
  },
  {
    id: 'cost',
    question: 'Which bound applies to the operation in this lesson?',
    choices: [
      'All possible operations are constant time.',
      'O(n) time; O(h) DFS stack or O(w) level frontier',
      'The number of animation frames is calibrated CPU time.',
    ],
    answer: 1,
    explanation:
      'Traversal order changes the output without changing the tree. The input is a complete binary tree, not an implicit BST; inorder is sorted only if the tree already satisfies BST ordering.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters here?',
    choices: [
      'Do not infer BST ordering merely because the tree is binary.',
      'Every binary search tree is automatically balanced.',
      'One tree traversal solves every arbitrary graph problem.',
    ],
    answer: 0,
    explanation: 'Do not infer BST ordering merely because the tree is binary.',
  },
];
export default quiz;
