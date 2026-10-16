const quiz = [
  {
    id: 'mechanism',
    question: 'What happens to an active environment at idle TTL?',
    choices: [
      'It stays active until its work finishes',
      'It expires even with a running request',
      'Its running work completes instantly',
    ],
    answer: 0,
    explanation:
      'A warm environment admits work only up to its concurrency. The AWS-style exercise uses one request per environment; the GCP-style exercise uses the configured request concurrency. Starting environments reserve slots for earlier FIFO waiters. Idle expiry never kills an active request.',
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
      'Compare concurrency one and four under a burst, then increase cold-start delay and lower the environment cap. Inspect completions, occupied slot ticks and pending/rejected requests.',
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
      'This is not a provider benchmark, billing calculator, provisioned-concurrency feature or exact scheduling implementation. Lambda and Cloud Run have different trigger/runtime modes.',
  },
];
export default quiz;
