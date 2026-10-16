const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'Pub-sub tasks represent independent consumers. An atomic inbox/effect boundary suppresses repeat side effects while delivery attempts and outstanding tasks remain visible.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'Pub-sub tasks represent independent consumers. An atomic inbox/effect boundary suppresses repeat side effects while delivery attempts and outstanding tasks remain visible.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'This model covers bounded delivery and consumer effects. It does not make cross-service transactions or event-schema compatibility automatic.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'This model covers bounded delivery and consumer effects. It does not make cross-service transactions or event-schema compatibility automatic.',
  },
  {
    id: 'practice',
    question: 'How should you test a proposed design?',
    choices: [
      'Change one assumption and check the state/accounting invariants.',
      'Judge it only by the number of boxes.',
      'Treat illustrative capacities as universal cloud benchmarks.',
    ],
    answer: 0,
    explanation:
      'A useful model makes its assumptions and consequences explicit; production measurements and full protocol validation remain necessary.',
  },
];
export default quiz;
