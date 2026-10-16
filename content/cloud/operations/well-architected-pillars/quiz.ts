const quiz = [
  {
    id: 'mechanism',
    question: 'Can a passing budget check erase a failed security constraint?',
    choices: [
      'No',
      'Yes, overall averages hide individual failures',
      'Yes, managed services need no identity review',
    ],
    answer: 0,
    explanation:
      'A declared review checks healthy and one-zone-loss processing capacity, instance budget, tested restore evidence, database exposure, identity scope, alert ownership and retention review. Each failed constraint stays independently actionable. Round-robin zone placement determines the largest failed-zone loss; no aggregate quality score hides security or recovery gaps.',
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
      'Add replicas to survive a zone loss, then inspect the budget consequence. Leave public DB exposure enabled and explain why a passing cost check does not resolve security. Record missing restore and alert evidence as actions.',
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
      'This is not a provider assessment, certification, SLA or total-cost calculation. Framework pillars differ by provider, and actual evidence, threat models, sustainability measurements and business requirements need review.',
  },
];
export default quiz;
