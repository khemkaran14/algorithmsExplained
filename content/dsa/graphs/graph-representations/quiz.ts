const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Read each validated edge.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'An adjacency list spends storage on vertices and existing edges. A matrix indexes pairs directly but allocates every possible pair.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible graph operation is always O(1).',
      'Lists take O(V+E) space; a matrix takes O(V\u00b2)',
      'The number of vertices is always equal to the number of edges.',
    ],
    answer: 1,
    explanation:
      'An adjacency list spends storage on vertices and existing edges. A matrix indexes pairs directly but allocates every possible pair.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'A zero-cost edge exists; null means absent.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation: 'A zero-cost edge exists; null means absent.',
  },
];
export default quiz;
