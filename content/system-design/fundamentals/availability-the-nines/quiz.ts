const quiz = [
  {
    id: 'distinction',
    question: 'Which statement fits this model?',
    choices: [
      'Compare serial dependencies with independent parallel replicas, then add a common failure factor. Compute expected downtime over an explicit period.',
      'A green diagram proves a cloud deployment is healthy.',
      'Every local acknowledgment proves globally agreed state.',
    ],
    answer: 0,
    explanation:
      'Compare serial dependencies with independent parallel replicas, then add a common failure factor. Compute expected downtime over an explicit period.',
  },
  {
    id: 'assumption',
    question: 'Which limitation should a design discussion include?',
    choices: [
      'No failure assumptions are necessary.',
      'Multiplying replica probabilities without checking common causes produces an optimistic promise, not a realistic availability estimate.',
      'Every workload scales linearly forever.',
    ],
    answer: 1,
    explanation:
      'Multiplying replica probabilities without checking common causes produces an optimistic promise, not a realistic availability estimate.',
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
