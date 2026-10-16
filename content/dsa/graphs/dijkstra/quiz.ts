const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Pop the smallest nonstale heap distance.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'Negative edges break the settling argument; stale heap entries must be discarded.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible graph operation is always O(1).',
      'O((V+E) log(V+E)) with lazy heap entries',
      'The number of vertices is always equal to the number of edges.',
    ],
    answer: 1,
    explanation:
      'Negative edges break the settling argument; stale heap entries must be discarded.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'Negative edges break the settling argument; stale heap entries must be discarded.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation:
      'Negative edges break the settling argument; stale heap entries must be discarded.',
  },
];
export default quiz;
