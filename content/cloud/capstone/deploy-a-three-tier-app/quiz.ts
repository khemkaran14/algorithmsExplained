const quiz = [
  {
    id: 'mechanism',
    question:
      'Does publicly exposing the database grant the application identity permission?',
    choices: [
      'No',
      'Yes, a public endpoint bypasses authentication',
      'Yes, cache misses implicitly become administrators',
    ],
    answer: 0,
    explanation:
      'Public HTTPS ingress reaches private app workers only through the declared load-balancer path. Public catalog cache hits can complete without the DB; misses require both private DB reachability and an authorized workload identity. Healthy app and shared DB budgets are finite, with bounded queues. Public DB exposure is flagged as risk rather than treated as an identity grant.',
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
      'Block DB identity and use zero cache hits, then compare 100% hits. Fail one app replica and account for completed, failed, rejected and pending requests. Restore private identity/path and inspect the shared DB bottleneck.',
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
      'This local capstone provisions nothing and does not deploy AlgoVerse. Production needs provider-specific IaC, TLS, secret rotation, schema migrations, backups, observability, restore drills and rollback. Cacheable data here is public catalog data only.',
  },
];
export default quiz;
