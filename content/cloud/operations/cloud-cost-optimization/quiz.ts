const quiz = [
  {
    id: 'mechanism',
    question:
      'Does higher origin-cache hit ratio automatically lower modeled client egress?',
    choices: [
      'No',
      'Yes, cached responses contain no bytes',
      'Yes, network egress is always free',
    ],
    answer: 0,
    explanation:
      'Transparent user-supplied rates estimate either provisioned instance-hours or origin request charges, storage over a 730-hour month, client egress using decimal KB/GB, and a flat cache rate. Origin hits reduce origin requests but not bytes still delivered to clients. The result lists components rather than hiding assumptions in a total.',
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
      'Compare cache disabled and enabled in per-request mode. Then use instances with very low traffic and explain why provisioned compute cost persists. Change egress rate and inspect which component changes.',
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
      'These are assumed USD inputs, not current provider pricing, quotes or a complete bill. Duration, tiers, commitments, taxes, minimum charges and regional transfers are excluded; verify provider calculators and actual invoices.',
  },
];
export default quiz;
