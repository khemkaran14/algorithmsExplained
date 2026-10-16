const quiz = [
  {
    id: 'mechanism',
    question: 'Does a stateless outbound allow automatically allow the reply?',
    choices: [
      'No, evaluate the return direction',
      'Yes, every firewall is stateful',
      'Yes, NAT disables firewall checks',
    ],
    answer: 0,
    explanation:
      'Stateful allow-list mode admits a reverse packet only for an established accepted flow. Ordered stateless rules evaluate each direction independently, so an outbound request can pass while its reply is denied. Priority-stateful mode demonstrates explicit deny selection, including deny-first ties. These are declared policies rather than universal provider rule merging.',
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
      'Allow outbound destination port 443 but omit the inbound ephemeral return range in stateless mode. Compare with stateful mode, then add a higher-priority matching deny.',
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
      'AWS security groups, NACLs and Google VPC firewall rules differ in attachment, priorities, denies and evaluation. This exercise does not merge every vendor policy layer.',
  },
];
export default quiz;
