const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Build a paired reverse arc for each capacity edge.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'Residual reverse arcs are separate from original opposite-direction edges. The final reachable cut certifies the answer. Source equal to sink returns zero in this teaching convention.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every possible graph operation is always O(1).',
      'Edmonds\u2013Karp O(VE\u00b2); integer DFS Ford\u2013Fulkerson O(E\u00b7|f*|)',
      'The number of vertices is always equal to the number of edges.',
    ],
    answer: 1,
    explanation:
      'Residual reverse arcs are separate from original opposite-direction edges. The final reachable cut certifies the answer. Source equal to sink returns zero in this teaching convention.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'Residual reverse arcs are separate from original opposite-direction edges. The final reachable cut certifies the answer. Source equal to sink returns zero in this teaching convention.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation:
      'Residual reverse arcs are separate from original opposite-direction edges. The final reachable cut certifies the answer. Source equal to sink returns zero in this teaching convention.',
  },
];
export default quiz;
