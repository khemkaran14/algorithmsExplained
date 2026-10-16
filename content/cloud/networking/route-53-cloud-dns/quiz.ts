const quiz = [
  {
    id: 'mechanism',
    question:
      'Does lowering the authoritative TTL shorten an already cached answer\u2019s expiry?',
    choices: [
      'No',
      'Yes, every resolver gets an immediate push',
      'Yes, old cache entries inherit the new TTL',
    ],
    answer: 0,
    explanation:
      'Two resolvers keep independent positive and negative entries until the original TTL expires. Authoritative changes and later TTL edits do not rewrite existing expirations. Health filtering applies only to fresh answers; a cached unhealthy endpoint remains visible until expiry. No records yields modeled NXDOMAIN, while no healthy answer is a different state.',
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
      'Resolve at A, change the authoritative record and resolve at B. Compare A before and after its original TTL. Then test a previously cached NXDOMAIN entry.',
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
      'Recursive caching, DNSSEC, failover/routing features and error-response caching are richer than this exercise. Route 53 health-routing and Google Cloud DNS integrations are not identical products.',
  },
];
export default quiz;
