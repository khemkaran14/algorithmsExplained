const quiz = [
  {
    id: 'invariant',
    question: 'Which step preserves this structure or query?',
    choices: [
      'Compare with the current node.',
      'Treat every binary tree as sorted.',
      'Ignore the representation\u2019s index convention.',
    ],
    answer: 0,
    explanation:
      'The tree preserves strict left<root<right ordering and stores duplicate keys once. Random insertion often gives logarithmic height, while sorted insertion creates a chain.',
  },
  {
    id: 'cost',
    question: 'Which bound applies to the operation in this lesson?',
    choices: [
      'All possible operations are constant time.',
      'O(h) per operation; h can reach n',
      'The number of animation frames is calibrated CPU time.',
    ],
    answer: 1,
    explanation:
      'The tree preserves strict left<root<right ordering and stores duplicate keys once. Random insertion often gives logarithmic height, while sorted insertion creates a chain.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters here?',
    choices: [
      'Two-child deletion must remove the successor from its old location.',
      'Every binary search tree is automatically balanced.',
      'One tree traversal solves every arbitrary graph problem.',
    ],
    answer: 0,
    explanation:
      'Two-child deletion must remove the successor from its old location.',
  },
];
export default quiz;
