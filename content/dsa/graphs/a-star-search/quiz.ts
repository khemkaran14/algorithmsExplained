const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Compute a consistent geometric lower bound.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'The heuristic uses the smallest edge cost per drawn unit; arbitrary geometric distances would overestimate on custom weighted graphs. Zero-cost edges may reduce h to zero.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible graph operation is always O(1).',
      'O((V+E) log(V+E)) with a consistent heuristic',
      'The number of vertices is always equal to the number of edges.',
    ],
    answer: 1,
    explanation:
      'The heuristic uses the smallest edge cost per drawn unit; arbitrary geometric distances would overestimate on custom weighted graphs. Zero-cost edges may reduce h to zero.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'The heuristic uses the smallest edge cost per drawn unit; arbitrary geometric distances would overestimate on custom weighted graphs. Zero-cost edges may reduce h to zero.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation:
      'The heuristic uses the smallest edge cost per drawn unit; arbitrary geometric distances would overestimate on custom weighted graphs. Zero-cost edges may reduce h to zero.',
  },
];
export default quiz;
