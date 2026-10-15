const quiz = [
  {
    id: 'invariant',
    question: 'Which step preserves this structure or query?',
    choices: [
      'Keep the input array in complete-tree order.',
      'Treat every binary tree as sorted.',
      'Ignore the representation\u2019s index convention.',
    ],
    answer: 0,
    explanation:
      'Nodes at height h number about n/2^(h+1). Summing their possible h-step repairs gives O(n), even though one root repair can take O(log n).',
  },
  {
    id: 'cost',
    question: 'Which bound applies to the operation in this lesson?',
    choices: [
      'All possible operations are constant time.',
      'O(n) construction; O(1) auxiliary repair workspace',
      'The number of animation frames is calibrated CPU time.',
    ],
    answer: 1,
    explanation:
      'Nodes at height h number about n/2^(h+1). Summing their possible h-step repairs gives O(n), even though one root repair can take O(log n).',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters here?',
    choices: [
      'Repeated insertion is O(n log n) worst-case; bottom-up heapify has the stronger linear build bound.',
      'Every binary search tree is automatically balanced.',
      'One tree traversal solves every arbitrary graph problem.',
    ],
    answer: 0,
    explanation:
      'Repeated insertion is O(n log n) worst-case; bottom-up heapify has the stronger linear build bound.',
  },
];
export default quiz;
