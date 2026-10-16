const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Mark the starting vertex on enqueue.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'Every reached vertex enters the FIFO frontier exactly once, and its outgoing adjacency list is scanned once. Discovery layers give shortest hop distances.',
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
      'Every reached vertex enters the FIFO frontier exactly once, and its outgoing adjacency list is scanned once. Discovery layers give shortest hop distances.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'Edge weights are ignored for hop distances; use Dijkstra or Bellman\u2013Ford for weighted routes.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation:
      'Edge weights are ignored for hop distances; use Dijkstra or Bellman\u2013Ford for weighted routes.',
  },
];
export default quiz;
