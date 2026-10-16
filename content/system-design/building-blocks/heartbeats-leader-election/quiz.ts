const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'After a missing-heartbeat timeout, only a connected configured majority can elect the modeled leader and acknowledge writes. Healing exposes higher terms and fences the older leader.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'After a missing-heartbeat timeout, only a connected configured majority can elect the modeled leader and acknowledge writes. Healing exposes higher terms and fences the older leader.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'This is an abstract quorum/fencing simulation, not Raft or Paxos. Durable votes, log freshness and recovery rules are required for a production consensus protocol.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'This is an abstract quorum/fencing simulation, not Raft or Paxos. Durable votes, log freshness and recovery rules are required for a production consensus protocol.',
  },
  {
    id: 'practice',
    question: 'How should you test a proposed design?',
    choices: [
      'Change one assumption and check the state/accounting invariants.',
      'Judge it only by the number of boxes.',
      'Treat illustrative capacities as universal cloud benchmarks.',
    ],
    answer: 0,
    explanation:
      'A useful model makes its assumptions and consequences explicit; production measurements and full protocol validation remain necessary.',
  },
];
export default quiz;
