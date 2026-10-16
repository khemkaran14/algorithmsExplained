const quiz = [
  {
    id: 'ownership',
    question: 'Which design decision does this case make explicit?',
    choices: [
      'Ingestion and transcoding prepare immutable segments before playback.',
      'Every diagram guarantees unlimited availability.',
      'A timeout always proves an external operation failed.',
    ],
    answer: 0,
    explanation:
      'Ingestion and transcoding prepare immutable segments before playback.',
  },
  {
    id: 'failure',
    question: 'Which experiment tests a real design assumption?',
    choices: [
      'Count boxes only.',
      'Compare adaptive and fixed-high selection on a falling-bandwidth trace. Insert zero-bandwidth intervals and inspect pending segments, stalls and transferred bytes.',
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
