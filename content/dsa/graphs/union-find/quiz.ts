const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Find both representatives.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'Union by size limits parent growth and compression shortens repeated finds. The inverse-Ackermann bound is amortized over a sequence, not a literal constant bound for every find.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible graph operation is always O(1).',
      'O((V+E) \u03b1(V)) amortized',
      'The number of vertices is always equal to the number of edges.',
    ],
    answer: 1,
    explanation:
      'Union by size limits parent growth and compression shortens repeated finds. The inverse-Ackermann bound is amortized over a sequence, not a literal constant bound for every find.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'Path compression changes parent paths without changing set membership.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation:
      'Path compression changes parent paths without changing set membership.',
  },
];
export default quiz;
