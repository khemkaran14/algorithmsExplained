const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Record DFS discovery times.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'The DFS root is an articulation point only with multiple DFS children; nonroots use a different test.',
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
      'The DFS root is an articulation point only with multiple DFS children; nonroots use a different test.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'The DFS root is an articulation point only with multiple DFS children; nonroots use a different test.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation:
      'The DFS root is an articulation point only with multiple DFS children; nonroots use a different test.',
  },
];
export default quiz;
