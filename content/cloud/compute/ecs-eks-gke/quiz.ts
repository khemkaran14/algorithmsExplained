const quiz = [
  {
    id: 'mechanism',
    question: 'Can maxSurge create a pod when no healthy node has a free slot?',
    choices: [
      'No',
      'Yes, surge creates physical resources automatically',
      'Yes, readiness is optional',
    ],
    answer: 0,
    explanation:
      'The same declared replica controller separates desired state, placement capacity and service readiness. Surge makes temporary extra capacity available; maxUnavailable limits deliberate removal of old ready endpoints. A failed node is an involuntary failure and can exceed that rollout budget.',
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
      'Reduce healthy node slots during a rollout. Decide whether to add node capacity, accept an unavailable budget or wait; do not assume surge overrides physical resources.',
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
      'ECS tasks/services and EKS/GKE pods/controllers are not interchangeable APIs. This shared conceptual model does not imply equal features, node management or prices.',
  },
];
export default quiz;
