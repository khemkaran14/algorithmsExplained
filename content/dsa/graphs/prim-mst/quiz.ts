const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Seed one unvisited component.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'Restart in disconnected components; negative edge weights are allowed for MSTs.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible graph operation is always O(1).',
      'O((V+E) log(V+E))',
      'The number of vertices is always equal to the number of edges.',
    ],
    answer: 1,
    explanation:
      'Restart in disconnected components; negative edge weights are allowed for MSTs.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'Restart in disconnected components; negative edge weights are allowed for MSTs.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation:
      'Restart in disconnected components; negative edge weights are allowed for MSTs.',
  },
];
export default quiz;
