const quiz = [
  {
    id: 'distinction',
    question: 'Which statement fits this model?',
    choices: [
      'Follow client ingress, load balancing, app processing, cache lookup and database completion. This throughput model abstracts DNS/TLS and transport details rather than pretending to simulate their packets.',
      'A green diagram proves a cloud deployment is healthy.',
      'Every local acknowledgment proves globally agreed state.',
    ],
    answer: 0,
    explanation:
      'Follow client ingress, load balancing, app processing, cache lookup and database completion. This throughput model abstracts DNS/TLS and transport details rather than pretending to simulate their packets.',
  },
  {
    id: 'assumption',
    question: 'Which limitation should a design discussion include?',
    choices: [
      'No failure assumptions are necessary.',
      'A successful app hop is not the same as a successful database-backed response.',
      'Every workload scales linearly forever.',
    ],
    answer: 1,
    explanation:
      'A successful app hop is not the same as a successful database-backed response.',
  },
  {
    id: 'method',
    question: 'How should you interpret the simulation?',
    choices: [
      'As deterministic state transitions under explicit assumptions.',
      'As a calibrated benchmark for every AWS and GCP service.',
      'As a substitute for validating a real deployment.',
    ],
    answer: 0,
    explanation:
      'The model tests reasoning and accounting invariants. Production systems need measurements and their full protocol/configuration guarantees.',
  },
];
export default quiz;
