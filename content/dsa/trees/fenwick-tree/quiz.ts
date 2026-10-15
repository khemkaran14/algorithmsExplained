const quiz = [
  {
    id: 'invariant',
    question: 'Which step preserves this structure or query?',
    choices: [
      'Use one-based storage indices.',
      'Treat every binary tree as sorted.',
      'Ignore the representation\u2019s index convention.',
    ],
    answer: 0,
    explanation:
      'Fenwick blocks partition each prefix into powers of two. The original value array remains zero-based; the index adds one during updates.',
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
      'Fenwick blocks partition each prefix into powers of two. The original value array remains zero-based; the index adds one during updates.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters here?',
    choices: [
      'A zero-based update loop using i += i & -i can get stuck at zero.',
      'Every binary search tree is automatically balanced.',
      'One tree traversal solves every arbitrary graph problem.',
    ],
    answer: 0,
    explanation:
      'A zero-based update loop using i += i & -i can get stuck at zero.',
  },
];
export default quiz;
