const quiz = [
  {
    id: 'ownership',
    question: 'Which design decision does this case make explicit?',
    choices: [
      'Persist the author log before issuing fan-out work.',
      'Every diagram guarantees unlimited availability.',
      'A timeout always proves an external operation failed.',
    ],
    answer: 0,
    explanation: 'Persist the author log before issuing fan-out work.',
  },
  {
    id: 'failure',
    question: 'Which experiment tests a real design assumption?',
    choices: [
      'Count boxes only.',
      'Stop fan-out workers and compare push, pull and hybrid reads. Raise the follower threshold and inspect queued copies and read scans.',
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
