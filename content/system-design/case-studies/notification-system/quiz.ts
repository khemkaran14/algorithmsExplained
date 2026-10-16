const quiz = [
  {
    id: 'ownership',
    question: 'Which design decision does this case make explicit?',
    choices: [
      'Persist notification intent before asynchronous delivery.',
      'Every diagram guarantees unlimited availability.',
      'A timeout always proves an external operation failed.',
    ],
    answer: 0,
    explanation: 'Persist notification intent before asynchronous delivery.',
  },
  {
    id: 'failure',
    question: 'Which experiment tests a real design assumption?',
    choices: [
      'Count boxes only.',
      'Make SMS channel index 1 unavailable, lose an acknowledgment and inspect healthy-channel completion, duplicate suppression and dead-letter tasks.',
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
