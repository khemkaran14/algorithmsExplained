const quiz = [
  {
    id: 'mechanism',
    question: 'When does a newly allocated instance provide modeled capacity?',
    choices: [
      'After its startup delay finishes',
      'At the instant scaling is requested',
      'Only after every queue is empty',
    ],
    answer: 0,
    explanation:
      'A bounded controller computes desired instances from lagged offered demand and target utilization. Startup delay separates allocated from serving capacity; cooldown and sustained low demand constrain oscillation. FIFO capacity completes old work before new arrivals, and queues have explicit limits.',
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
      'Raise startup and metric delay under the same spike. Compare pending and rejected work, then reduce the maximum instance count to expose a hard capacity ceiling.',
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
      'This demand-derived controller is not an implementation of either provider\u2019s autoscaler. Product metrics, health replacement, warm pools and stabilization behavior differ.',
  },
];
export default quiz;
