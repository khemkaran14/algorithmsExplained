const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'Queue mode shares one group; pub-sub creates an independent task for each subscription. Inject an acknowledgment loss, compare idempotent versus repeated effects and exhaust retries into a DLQ.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'Queue mode shares one group; pub-sub creates an independent task for each subscription. Inject an acknowledgment loss, compare idempotent versus repeated effects and exhaust retries into a DLQ.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'A broker acknowledgment is not an atomic transaction with an unrelated database. A DLQ task may already have produced an effect before acknowledgment was lost.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'A broker acknowledgment is not an atomic transaction with an unrelated database. A DLQ task may already have produced an effect before acknowledgment was lost.',
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
