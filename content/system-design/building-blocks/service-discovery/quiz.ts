const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'Read service a through a resolver cache, register a new integer endpoint ID and observe how lost active invalidation leaves the cached endpoint until TTL expiry.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'Read service a through a resolver cache, register a new integer endpoint ID and observe how lost active invalidation leaves the cached endpoint until TTL expiry.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'Endpoint IDs are illustrative integers, and the model focuses on cache propagation. Health probes, leases, DNS record types and secure discovery require additional mechanisms.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'Endpoint IDs are illustrative integers, and the model focuses on cache propagation. Health probes, leases, DNS record types and secure discovery require additional mechanisms.',
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
