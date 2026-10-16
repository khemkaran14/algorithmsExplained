const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Initialize the start at zero.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'A negative cycle unreachable from the start does not make this source\u2019s distances unbounded.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible graph operation is always O(1).',
      'O(VE)',
      'The number of vertices is always equal to the number of edges.',
    ],
    answer: 1,
    explanation:
      'A negative cycle unreachable from the start does not make this source\u2019s distances unbounded.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'A negative cycle unreachable from the start does not make this source\u2019s distances unbounded.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation:
      'A negative cycle unreachable from the start does not make this source\u2019s distances unbounded.',
  },
];
export default quiz;
