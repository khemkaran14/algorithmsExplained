const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this algorithm?',
    choices: [
      'Initialize an accumulator to zero.',
      'Skip equality checks whenever two hashes match.',
      'Use the animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'A good table hash spreads ordinary keys; it does not prevent a determined attacker. This polynomial example is deliberately noncryptographic.',
  },
  {
    id: 'cost',
    question: 'Which cost model is appropriate?',
    choices: [
      'Every operation is always O(1).',
      'O(L) time and O(1) auxiliary space',
      'Hashing eliminates all collisions.',
    ],
    answer: 1,
    explanation:
      'A good table hash spreads ordinary keys; it does not prevent a determined attacker. This polynomial example is deliberately noncryptographic.',
  },
  {
    id: 'pitfall',
    question: 'Which warning applies?',
    choices: [
      'Hash equality does not prove key equality.',
      'Possible membership proves exact membership.',
      'Adding a ring node must move every key.',
    ],
    answer: 0,
    explanation: 'Hash equality does not prove key equality.',
  },
];
export default quiz;
