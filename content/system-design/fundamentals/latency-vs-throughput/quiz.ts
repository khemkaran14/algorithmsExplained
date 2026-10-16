const quiz = [
  {
    id: 'distinction',
    question: 'Which statement fits this model?',
    choices: [
      'Compare completed requests per modeled second against the queue-derived response latency. Raise offered load until the bottleneck queue grows, then observe admission rejection.',
      'A green diagram proves a cloud deployment is healthy.',
      'Every local acknowledgment proves globally agreed state.',
    ],
    answer: 0,
    explanation:
      'Compare completed requests per modeled second against the queue-derived response latency. Raise offered load until the bottleneck queue grows, then observe admission rejection.',
  },
  {
    id: 'assumption',
    question: 'Which limitation should a design discussion include?',
    choices: [
      'No failure assumptions are necessary.',
      'The modeled p95 counts only completed requests. Pending/rejected requests must remain visible to avoid a misleading healthy-looking percentile.',
      'Every workload scales linearly forever.',
    ],
    answer: 1,
    explanation:
      'The modeled p95 counts only completed requests. Pending/rejected requests must remain visible to avoid a misleading healthy-looking percentile.',
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
