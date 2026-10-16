const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Count incoming edges.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'A partial Kahn result is not a valid complete order when a cycle remains.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible graph operation is always O(1).',
      'O(V+E)',
      'The number of vertices is always equal to the number of edges.',
    ],
    answer: 1,
    explanation:
      'A partial Kahn result is not a valid complete order when a cycle remains.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'A partial Kahn result is not a valid complete order when a cycle remains.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation:
      'A partial Kahn result is not a valid complete order when a cycle remains.',
  },
];
export default quiz;
