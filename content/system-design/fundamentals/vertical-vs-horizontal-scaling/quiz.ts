const quiz = [
  {
    id: 'distinction',
    question: 'Which statement fits this model?',
    choices: [
      'Compare CPU units per replica with the number of app replicas. Each changes the app service budget; database capacity, cache behavior and shared failures remain separate constraints.',
      'A green diagram proves a cloud deployment is healthy.',
      'Every local acknowledgment proves globally agreed state.',
    ],
    answer: 0,
    explanation:
      'Compare CPU units per replica with the number of app replicas. Each changes the app service budget; database capacity, cache behavior and shared failures remain separate constraints.',
  },
  {
    id: 'assumption',
    question: 'Which limitation should a design discussion include?',
    choices: [
      'No failure assumptions are necessary.',
      'The linear CPU budget is an explicit toy assumption, not a benchmark. Stateful coordination and real hardware can prevent linear scaling.',
      'Every workload scales linearly forever.',
    ],
    answer: 1,
    explanation:
      'The linear CPU budget is an explicit toy assumption, not a benchmark. Stateful coordination and real hardware can prevent linear scaling.',
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
