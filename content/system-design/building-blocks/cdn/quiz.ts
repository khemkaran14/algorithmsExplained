const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'The edge-cache model serves hits before origin app/database work. A simulated origin-region outage still permits existing global edge hits; misses reject when the origin is unavailable.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'The edge-cache model serves hits before origin app/database work. A simulated origin-region outage still permits existing global edge hits; misses reject when the origin is unavailable.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'This workload model assumes a target hit fraction and immutable cached responses. It does not implement an HTTP cache or authorize caching private paid content.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'This workload model assumes a target hit fraction and immutable cached responses. It does not implement an HTTP cache or authorize caching private paid content.',
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
