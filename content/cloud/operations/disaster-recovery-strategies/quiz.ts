const quiz = [
  {
    id: 'mechanism',
    question: 'Which data may recovery use?',
    choices: [
      'The last completed replica or backup snapshot',
      'An unfinished future snapshot',
      'Every acknowledged write regardless of replication',
    ],
    answer: 0,
    explanation:
      'Cross-region copies complete after a declared delay and stop when the primary quorum is unavailable. Promotion fences the old primary. Backup restore uses the last completed periodic snapshot instead. Detection, promotion and restoration take model ticks; RPO counts lost acknowledged writes.',
  },
  {
    id: 'evidence',
    question: 'Which evidence best tests this lesson\u2019s design assumption?',
    choices: [
      'Change one declared workload or failure parameter and explain the resulting state.',
      'Treat the provider label as proof of correctness.',
      'Assume a clean diagram means production is healthy.',
    ],
    answer: 0,
    explanation:
      'Fail the primary region between snapshots. Compare cross-region promotion and backup restore, then increase copy delay and inspect the actual lost record IDs.',
  },
  {
    id: 'scope',
    question: 'What does running this exercise do?',
    choices: [
      'Provision the named cloud resources.',
      'Advance a bounded local model; validate real service behavior separately.',
      'Guarantee provider uptime and current pricing.',
    ],
    answer: 1,
    explanation:
      'RPO is lost records and RTO model ticks, not a provider time guarantee. Copies still in flight at primary failure do not become magically complete. Recovery needs tested procedures and real backup retention.',
  },
];
export default quiz;
