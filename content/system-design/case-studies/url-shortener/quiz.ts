const quiz = [
  {
    id: 'ownership',
    question: 'Which design decision does this case make explicit?',
    choices: [
      'Start from unique, persistent code ownership before adding a cache.',
      'Every diagram guarantees unlimited availability.',
      'A timeout always proves an external operation failed.',
    ],
    answer: 0,
    explanation:
      'Start from unique, persistent code ownership before adding a cache.',
  },
  {
    id: 'failure',
    question: 'Which experiment tests a real design assumption?',
    choices: [
      'Count boxes only.',
      'Lose delete invalidation, resolve 001 after deletion, and compare the stale redirect with a correct invalidation. Reduce token length and compare sequential and collision-probed allocation.',
      'Treat every retry as a new effect.',
    ],
    answer: 1,
    explanation:
      'Observe the state and resource accounting after changing the failure assumption.',
  },
  {
    id: 'estimates',
    question: 'What do the editable capacity estimates represent?',
    choices: [
      'Guaranteed real provider capacity.',
      'Planning assumptions that need workload validation.',
      'A promise of zero replication overhead.',
    ],
    answer: 1,
    explanation:
      'Peak requests and payload retention are explicit assumptions; production measurements and overheads must be added.',
  },
];
export default quiz;
