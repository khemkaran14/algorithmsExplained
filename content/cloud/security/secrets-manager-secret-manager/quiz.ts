const quiz = [
  {
    id: 'mechanism',
    question: 'Can a pending version promote after validation fails?',
    choices: [
      'No',
      'Yes, a new version is always trusted',
      'Yes, if the old credential still works',
    ],
    answer: 0,
    explanation:
      'Rotation creates a pending public symbolic version, configures the target to accept it, validates it, then promotes. Old credentials retire separately after planned overlap. Reader permission controls future fetches; already cached credentials persist until application TTL, and target acceptance controls authentication.',
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
      'Cache v1, promote v2, retire v1, then use the still-fresh cache and observe failure. Refresh explicitly. Separately revoke read access and inspect why an existing accepted cached credential may still work.',
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
      'No real secret value is stored. Provider staged rotation/version APIs differ; actual credentials require protected transport/storage, auditing and target-side revocation. A fetch permission change is not cache erasure.',
  },
];
export default quiz;
