const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this graph algorithm?',
    choices: [
      'Start a traversal at an unlabelled vertex.',
      'Treat every directed graph as undirected.',
      'Use animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'A traversal labels one undirected reachability region. Restarting at unseen seeds adds no repeated vertex scans, so all components together remain linear.',
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
      'A traversal labels one undirected reachability region. Restarting at unseen seeds adds no repeated vertex scans, so all components together remain linear.',
  },
  {
    id: 'pitfall',
    question: 'Which graph assumption or limitation matters?',
    choices: [
      'Directed strong connectivity is a different problem.',
      'DFS always computes weighted shortest paths.',
      'Unreachable vertices must have distance zero.',
    ],
    answer: 0,
    explanation: 'Directed strong connectivity is a different problem.',
  },
];
export default quiz;
