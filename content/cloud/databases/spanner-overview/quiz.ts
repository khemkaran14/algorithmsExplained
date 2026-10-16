const quiz = [
  {
    id: 'mechanism',
    question: 'Can a minority return a modeled strong read?',
    choices: [
      'No',
      'Yes, a local value is always globally current',
      'Yes, clock precision replaces a quorum',
    ],
    answer: 0,
    explanation:
      'A fixed-majority register isolates node zero during a partition. Majority writes update reachable copies; strong reads require a majority, while a stale read inspects one local value. A declared clock interval chooses a timestamp and optionally waits until the earliest possible current time exceeds it. Healing propagates the latest register version.',
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
      'Write from the majority and compare a minority strong read with a local stale read. Heal the partition. Disable commit-wait and inspect the timing-condition flag without claiming the centralized sequencer demonstrates a real external-consistency anomaly.',
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
      'This is not Paxos, TrueTime infrastructure, Spanner SQL transactions or an Aurora DSQL emulator. The AWS comparison does not imply the same clock or consensus implementation.',
  },
];
export default quiz;
