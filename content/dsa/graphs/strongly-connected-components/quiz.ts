const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Collect DFS finish order and traverse the transpose for Kosaraju.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'Do not use undirected components or reachability from a single seed as a substitute for SCCs.',
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
      'Do not use undirected components or reachability from a single seed as a substitute for SCCs.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'Do not use undirected components or reachability from a single seed as a substitute for SCCs.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation:
      'Do not use undirected components or reachability from a single seed as a substitute for SCCs.',
  },
];
export default quiz;
