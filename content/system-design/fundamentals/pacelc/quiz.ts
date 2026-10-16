const quiz = [
  {
    id: 'distinction',
    question: 'Which statement fits this model?',
    choices: [
      'Compare strong and eventual policies with no partition, watching modeled acknowledgment latency. Then inject a partition and compare rejected versus locally available operations.',
      'A green diagram proves a cloud deployment is healthy.',
      'Every local acknowledgment proves globally agreed state.',
    ],
    answer: 0,
    explanation:
      'Compare strong and eventual policies with no partition, watching modeled acknowledgment latency. Then inject a partition and compare rejected versus locally available operations.',
  },
  {
    id: 'assumption',
    question: 'Which limitation should a design discussion include?',
    choices: [
      'No failure assumptions are necessary.',
      'The displayed latency is an operation-delay model, not a production network estimate. PACELC is a design framing, not a new consistency protocol.',
      'Every workload scales linearly forever.',
    ],
    answer: 1,
    explanation:
      'The displayed latency is an operation-delay model, not a production network estimate. PACELC is a design framing, not a new consistency protocol.',
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
