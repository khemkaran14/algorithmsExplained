const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'Compare token buckets, fixed windows, exact weighted sliding logs and approximate sliding counters. Client keys have independent state, and admitted requests consume their full cost.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'Compare token buckets, fixed windows, exact weighted sliding logs and approximate sliding counters. Client keys have independent state, and admitted requests consume their full cost.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'Fixed-window boundary bursts and sliding-counter approximation are real policy differences. A local model is not a distributed Redis atomicity guarantee.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'Fixed-window boundary bursts and sliding-counter approximation are real policy differences. A local model is not a distributed Redis atomicity guarantee.',
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
