const quiz = [
  {
    id: 'distinction',
    question: 'Which statement fits this model?',
    choices: [
      'Strong mode requires agreement from both replicas and rejects partitioned operations. Eventual mode serves local operations and can diverge. This illustrates a two-replica policy, not an arbitrary full consensus implementation.',
      'A green diagram proves a cloud deployment is healthy.',
      'Every local acknowledgment proves globally agreed state.',
    ],
    answer: 0,
    explanation:
      'Strong mode requires agreement from both replicas and rejects partitioned operations. Eventual mode serves local operations and can diverge. This illustrates a two-replica policy, not an arbitrary full consensus implementation.',
  },
  {
    id: 'assumption',
    question: 'Which limitation should a design discussion include?',
    choices: [
      'No failure assumptions are necessary.',
      'CAP does not mean freely choosing any two letters at all times; the trade-off applies while a partition prevents communication.',
      'Every workload scales linearly forever.',
    ],
    answer: 1,
    explanation:
      'CAP does not mean freely choosing any two letters at all times; the trade-off applies while a partition prevents communication.',
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
