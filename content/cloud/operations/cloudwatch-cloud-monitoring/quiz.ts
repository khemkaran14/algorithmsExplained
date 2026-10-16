const quiz = [
  {
    id: 'mechanism',
    question: 'How is the window error fraction computed?',
    choices: [
      'Total errors divided by total requests',
      'Mean of bucket percentages regardless of traffic',
      'Missing samples count as successful requests',
    ],
    answer: 0,
    explanation:
      'Rolling windows sum requests and errors before division. Burn rate is observed error fraction divided by the declared allowed fraction. Consecutive breaching evaluations fire an alert. Missing data is explicitly unknown, ignored or breaching; zero traffic has no defined error fraction. Latency is displayed as bucket means, not fabricated percentiles.',
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
      'Compare 1/1 errors with 0/999 errors using a two-bucket window. Then replace samples with missing values and test each missing-data policy and consecutive threshold.',
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
      'No metrics leave the browser/server model. A request-based SLO is not an availability SLA; real alerts need multi-window design, ownership, retention and validated telemetry quality.',
  },
];
export default quiz;
