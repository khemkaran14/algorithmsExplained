const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Color a new component seed.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'Two-color BFS visits every component. An equal-color edge closes an odd-cycle obstruction, while successful parity assignments satisfy every edge.',
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
      'Two-color BFS visits every component. An equal-color edge closes an odd-cycle obstruction, while successful parity assignments satisfy every edge.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'An odd cycle or a self-loop prevents a two-coloring.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation: 'An odd cycle or a self-loop prevents a two-coloring.',
  },
];
export default quiz;
