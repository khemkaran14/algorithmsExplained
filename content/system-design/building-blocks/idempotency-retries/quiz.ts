const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'Bind a caller-scoped key to one payload. Compare an atomic local inbox/ledger transaction with a crash between split writes, then replay lost responses and reject payload conflicts.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'Bind a caller-scoped key to one payload. Compare an atomic local inbox/ledger transaction with a crash between split writes, then replay lost responses and reject payload conflicts.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'A local transaction cannot atomically include an unrelated external payment network. Provider idempotency, reconciliation and uncertain-outcome handling remain necessary.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'A local transaction cannot atomically include an unrelated external payment network. Provider idempotency, reconciliation and uncertain-outcome handling remain necessary.',
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
