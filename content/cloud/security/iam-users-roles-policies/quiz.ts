const quiz = [
  {
    id: 'mechanism',
    question:
      'Which result wins when both an allow and an explicit deny match?',
    choices: ['Deny', 'Allow', 'Whichever rule appears last'],
    answer: 0,
    explanation:
      'A bounded policy evaluator matches case-sensitive action/resource globs, then checks declared MFA, environment and source CIDR conditions. Explicit deny overrides matching allow; missing allow denies. Role trust issues an expiring session bound to the original principal. A caller cannot forge a reserved role identity.',
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
      'Compare an explicit deny with a broad allow, then expire a role session and retry. Change source CIDR and MFA independently rather than assuming a role name proves authentication.',
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
      'Real AWS IAM and Google IAM evaluation is richer and structurally different: organizations, resource policies, boundaries, conditions and identity federation are outside this flattened exercise. Inputs are trusted lesson scenarios, never an app authorization pattern.',
  },
];
export default quiz;
