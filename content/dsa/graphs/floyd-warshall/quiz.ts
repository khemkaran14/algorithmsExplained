const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Initialize diagonal zero and edge weights.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'The k loop must be outermost for this invariant. A negative diagonal identifies a negative cycle.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible graph operation is always O(1).',
      'O(V\u00b3) time and O(V\u00b2) workspace',
      'The number of vertices is always equal to the number of edges.',
    ],
    answer: 1,
    explanation:
      'The k loop must be outermost for this invariant. A negative diagonal identifies a negative cycle.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'The k loop must be outermost for this invariant. A negative diagonal identifies a negative cycle.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation:
      'The k loop must be outermost for this invariant. A negative diagonal identifies a negative cycle.',
  },
];
export default quiz;
