const quiz = [
  {
    id: 'mechanism',
    question: 'Does a failure in one routed target block every other target?',
    choices: [
      'No, deliveries are independent',
      'Yes, all routed effects are one transaction',
      'Yes, dead letters erase successful effects',
    ],
    answer: 0,
    explanation:
      'Attribute rules select target names before delivery tasks exist. Overlapping rules collapse to one occurrence/target pair. Repeated IDs remain deliveries, but a target-local atomic inbox can suppress repeated local effects. An unavailable target retries to a bounded dead-letter outcome without blocking another target.',
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
      'Repeat an event ID and fail only email. Inspect audit effects, suppressed duplicates and email dead letters. Add a rule that does not match and account for unmatched events separately from failed delivery.',
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
      'This is a local filter/inbox exercise, not either provider\u2019s filter grammar, connector catalog or delivery guarantee. Event IDs must be immutable and external side effects need their own idempotency protocol.',
  },
];
export default quiz;
