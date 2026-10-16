const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'The traffic variant shows the ingress boundary and downstream bottlenecks. The admission-policy variant compares four rate algorithms on timestamped client requests.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'The traffic variant shows the ingress boundary and downstream bottlenecks. The admission-policy variant compares four rate algorithms on timestamped client requests.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'The model illustrates traffic and rate admission only; drawing an API gateway does not implement authentication, TLS configuration or every routing rule.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'The model illustrates traffic and rate admission only; drawing an API gateway does not implement authentication, TLS configuration or every routing rule.',
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
