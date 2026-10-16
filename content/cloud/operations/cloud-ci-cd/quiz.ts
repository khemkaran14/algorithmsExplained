const quiz = [
  {
    id: 'mechanism',
    question: 'What happens when a stage has too few candidate samples?',
    choices: [
      'Hold at the current canary weight',
      'Promote because no error was observed',
      'Declare rollback proves the artifact is malicious',
    ],
    answer: 0,
    explanation:
      'Tests, policy and signature gates reject an ineligible immutable candidate before traffic. Seeded observations at 10%, 25% and 50% candidate traffic measure both absolute error and regression versus contemporaneous baseline. Insufficient candidate samples hold; exceeded guardrails roll back; all successful stages promote.',
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
      'Set candidate errors to 100% and inspect rollback. Use one request per stage to force hold. Then set both error assumptions to zero with enough observations and verify promotion.',
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
      'Synthetic requests are not statistical significance, actual build results or a real deployment. Supply-chain trust, approval policy, migration compatibility and production monitoring remain operational requirements.',
  },
];
export default quiz;
