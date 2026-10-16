const quiz = [
  {
    id: 'mechanism',
    question:
      'Which placement can survive losing zone zero with three replicas and three zones?',
    choices: [
      'One replica in each zone',
      'All three replicas in zone zero',
      'A single replica with three zone labels',
    ],
    answer: 0,
    explanation:
      'Primary replicas acknowledge only with a fixed majority. Round-robin placement across zones survives a zone loss when enough votes remain. A whole-region outage is a separate fault; adding zones inside that region cannot survive it.',
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
      'Compare single-zone and multi-zone under zone loss. Then select region loss with the same replica count and explain why the primary quorum disappears.',
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
      'The exercise does not claim a cloud SLA or emulate a provider control plane. Correlated power, network and account failures need a broader threat model.',
  },
];
export default quiz;
