const quiz = [
  {
    id: 'mechanism',
    question: 'Which behavior is modeled?',
    choices: [
      'Queue mode shares one consumer group; fan-out creates an independent task per subscriber. Visibility expiry, lost acknowledgments, poison work, bounded retries and an atomic local inbox make pending, duplicate-suppressed and dead-letter outcomes visible.',
      'Service labels automatically provision secure resources.',
      'Every timeout proves an operation failed.',
    ],
    answer: 0,
    explanation:
      'Queue mode shares one consumer group; fan-out creates an independent task per subscriber. Visibility expiry, lost acknowledgments, poison work, bounded retries and an atomic local inbox make pending, duplicate-suppressed and dead-letter outcomes visible.',
  },
  {
    id: 'scope',
    question: 'Which provider limitation matters?',
    choices: [
      'All products expose identical guarantees.',
      'These services have different ordering, acknowledgment, retention and optional delivery guarantees. The atomic inbox protects a modeled local effect; external email/charges still need their own idempotency protocol. Do not infer universal exactly-once delivery from this diagram.',
      'Illustrative capacities are published cloud benchmarks.',
    ],
    answer: 1,
    explanation:
      'These services have different ordering, acknowledgment, retention and optional delivery guarantees. The atomic inbox protects a modeled local effect; external email/charges still need their own idempotency protocol. Do not infer universal exactly-once delivery from this diagram.',
  },
  {
    id: 'experiment',
    question: 'Which experiment tests a design assumption?',
    choices: [
      'Lose the first acknowledgment and compare local deduplication enabled/disabled. Poison one message and account for each group\u2019s completed, dead or pending task.',
      'Count boxes without changing inputs.',
      'Put access keys in the browser bundle.',
    ],
    answer: 0,
    explanation:
      'Change an explicit workload/failure assumption and inspect the conserved state.',
  },
];
export default quiz;
