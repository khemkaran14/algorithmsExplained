const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'Watch round-robin app processing, per-replica work counts and the separate database budget. Losing one app instance reduces available app capacity; extra instances do not make a failed database healthy.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'Watch round-robin app processing, per-replica work counts and the separate database budget. Losing one app instance reduces available app capacity; extra instances do not make a failed database healthy.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'This model demonstrates round-robin healthy-target distribution, not every provider\u2019s connection, session-affinity or least-load policy.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'This model demonstrates round-robin healthy-target distribution, not every provider\u2019s connection, session-affinity or least-load policy.',
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
