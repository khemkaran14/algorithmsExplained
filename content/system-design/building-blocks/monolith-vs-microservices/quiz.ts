const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'Hold total compute budget fixed. Catalog requests need catalog only; checkout also needs orders/payments. Compare a shared-process crash with an isolated payments crash and inspect dependent versus unrelated routes.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'Hold total compute budget fixed. Catalog requests need catalog only; checkout also needs orders/payments. Compare a shared-process crash with an isolated payments crash and inspect dependent versus unrelated routes.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'Splitting boxes does not remove dependencies or create unlimited capacity. The model omits deployment, data ownership and distributed-transaction complexity.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'Splitting boxes does not remove dependencies or create unlimited capacity. The model omits deployment, data ownership and distributed-transaction complexity.',
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
