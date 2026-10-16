const quiz = [
  {
    id: 'distinction',
    question: 'Which statement fits this model?',
    choices: [
      'Compare global two-replica agreement, eventual local reads and session-token checks. A stale session replica waits rather than returning an older observed version.',
      'A green diagram proves a cloud deployment is healthy.',
      'Every local acknowledgment proves globally agreed state.',
    ],
    answer: 0,
    explanation:
      'Compare global two-replica agreement, eventual local reads and session-token checks. A stale session replica waits rather than returning an older observed version.',
  },
  {
    id: 'assumption',
    question: 'Which limitation should a design discussion include?',
    choices: [
      'No failure assumptions are necessary.',
      'Session read-your-writes/monotonic reads do not make every client globally linearizable. Logical conflict priority is not a guarantee of physical-time recency.',
      'Every workload scales linearly forever.',
    ],
    answer: 1,
    explanation:
      'Session read-your-writes/monotonic reads do not make every client globally linearizable. Logical conflict priority is not a guarantee of physical-time recency.',
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
