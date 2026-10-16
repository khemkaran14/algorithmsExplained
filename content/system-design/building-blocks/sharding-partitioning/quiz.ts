const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'Place the same keys by modulo, equal-width 0\u2013999 ranges or consistent hashing, then add one node. Compare load skew and changed owners.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'Place the same keys by modulo, equal-width 0\u2013999 ranges or consistent hashing, then add one node. Compare load skew and changed owners.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'Equal-width ranges are recomputed in this example. Production ranges can stay fixed and be split independently; hot keys and cross-shard transactions need separate designs.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'Equal-width ranges are recomputed in this example. Production ranges can stay fixed and be split independently; hot keys and cross-shard transactions need separate designs.',
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
