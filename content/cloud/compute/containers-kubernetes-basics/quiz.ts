const quiz = [
  {
    id: 'mechanism',
    question: 'Does a starting pod count as a ready service endpoint?',
    choices: [
      'No',
      'Yes, once its object exists',
      'Yes, if it has the newest image tag',
    ],
    answer: 0,
    explanation:
      'A controller reconciles target-version replicas within a surge cap. A scheduler selects healthy nodes with available slots. Only ready pods receive service traffic; an old ready endpoint is deleted only within the declared unavailable budget. Unready old pods can be removed without losing another ready endpoint.',
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
      'Make new-version readiness fail. Inspect old endpoints retained, then schedule rollback to v1 and compare recovery with deleting healthy old pods immediately.',
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
      'This bounded scheduler is not Kubernetes, ECS or kubelet. Readiness probes, networking, image provenance, volumes and disruption budgets are additional systems.',
  },
];
export default quiz;
