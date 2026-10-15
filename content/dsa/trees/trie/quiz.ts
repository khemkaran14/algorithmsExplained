const quiz = [
  {
    id: 'invariant',
    question: 'Which step preserves this structure or query?',
    choices: [
      'Follow one edge per character.',
      'Treat every binary tree as sorted.',
      'Ignore the representation\u2019s index convention.',
    ],
    answer: 0,
    explanation:
      'Each edge consumes one lowercase character. A node can exist as a prefix without representing a full stored word. The star marks a terminal node.',
  },
  {
    id: 'cost',
    question: 'Which bound applies to the operation in this lesson?',
    choices: [
      'All possible operations are constant time.',
      'O(L) insertion/query; O(total stored characters) space',
      'The number of animation frames is calibrated CPU time.',
    ],
    answer: 1,
    explanation:
      'Each edge consumes one lowercase character. A node can exist as a prefix without representing a full stored word. The star marks a terminal node.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters here?',
    choices: [
      'Searching for a prefix and searching for an exact word require different terminal checks.',
      'Every binary search tree is automatically balanced.',
      'One tree traversal solves every arbitrary graph problem.',
    ],
    answer: 0,
    explanation:
      'Searching for a prefix and searching for an exact word require different terminal checks.',
  },
];
export default quiz;
