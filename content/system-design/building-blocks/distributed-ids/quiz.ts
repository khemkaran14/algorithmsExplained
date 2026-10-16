const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'The tiny timestamp/worker/sequence layout exposes sequence exhaustion, clock rollback and deliberately duplicated worker assignments. Choose rejection or explicit logical-time advancement.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'The tiny timestamp/worker/sequence layout exposes sequence exhaustion, clock rollback and deliberately duplicated worker assignments. Choose rejection or explicit logical-time advancement.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'These are toy bit widths. IDs can reveal timing and are not authorization secrets; logical time can run ahead of wall time.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'These are toy bit widths. IDs can reveal timing and are not authorization secrets; logical time can run ahead of wall time.',
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
