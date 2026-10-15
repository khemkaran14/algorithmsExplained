const quiz = [
  {
    id: 'invariant',
    question: 'Which step preserves this structure or query?',
    choices: [
      'Build undirected adjacency.',
      'Treat every binary tree as sorted.',
      'Ignore the representation\u2019s index convention.',
    ],
    answer: 0,
    explanation:
      'For an unweighted tree, the two-traversal method finds a diameter. Length counts edges, so a single-node tree has diameter zero. The connected, acyclic input constraint is essential.',
  },
  {
    id: 'cost',
    question: 'Which bound applies to the operation in this lesson?',
    choices: [
      'All possible operations are constant time.',
      'O(n) time and space',
      'The number of animation frames is calibrated CPU time.',
    ],
    answer: 1,
    explanation:
      'For an unweighted tree, the two-traversal method finds a diameter. Length counts edges, so a single-node tree has diameter zero. The connected, acyclic input constraint is essential.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters here?',
    choices: [
      'The same two-BFS rule does not solve diameter for every arbitrary graph.',
      'Every binary search tree is automatically balanced.',
      'One tree traversal solves every arbitrary graph problem.',
    ],
    answer: 0,
    explanation:
      'The same two-BFS rule does not solve diameter for every arbitrary graph.',
  },
];
export default quiz;
