const quiz = [
  {
    id: 'mechanism',
    question:
      'Does deleting a GCP-style live generation automatically make an archived generation live?',
    choices: [
      'No',
      'Yes, always the oldest generation',
      'Yes, any archived generation is chosen randomly',
    ],
    answer: 0,
    explanation:
      'The AWS-style model creates a delete marker for an unqualified delete; deleting that marker may reveal an older version. The GCP-style model removes the live generation without creating a marker, and archived generations do not automatically become live. Conditional model tokens reject stale writes; archived expiry uses time since becoming noncurrent.',
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
      'Put two values, delete the live object and inspect provider behavior. Explicitly remove a version, then try a stale compare-token write. Never paste real application data into this practice model.',
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
      'Tokens are teaching SHA-256 values, not real ETags or native generation-match conditions. Lifecycle policy, retention locks, replication and permissions need provider-specific design.',
  },
];
export default quiz;
