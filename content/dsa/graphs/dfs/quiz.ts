const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Enter and mark one vertex.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'Each vertex is entered once and each outgoing edge is considered once. Recursive activations retain the current branch until it is fully explored.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible graph operation is always O(1).',
      'O(V+E) time and O(V) traversal workspace',
      'The number of vertices is always equal to the number of edges.',
    ],
    answer: 1,
    explanation:
      'Each vertex is entered once and each outgoing edge is considered once. Recursive activations retain the current branch until it is fully explored.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'DFS discovery depth is not generally a shortest-path distance.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation:
      'DFS discovery depth is not generally a shortest-path distance.',
  },
];
export default quiz;
