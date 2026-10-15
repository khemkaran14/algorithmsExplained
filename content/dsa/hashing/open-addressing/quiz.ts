const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this algorithm?',
    choices: [
      'Hash into the first slot.',
      'Skip equality checks whenever two hashes match.',
      'Use the animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'Linear probing clusters; quadratic probing may visit only a subset of slots. With a prime capacity and nonzero step, double hashing visits every slot before repeating.',
  },
  {
    id: 'cost',
    question: 'Which cost model is appropriate?',
    choices: [
      'Every operation is always O(1).',
      'Expected O(1) at low load; worst O(m) insertion, O(m) space',
      'Hashing eliminates all collisions.',
    ],
    answer: 1,
    explanation:
      'Linear probing clusters; quadratic probing may visit only a subset of slots. With a prime capacity and nonzero step, double hashing visits every slot before repeating.',
  },
  {
    id: 'pitfall',
    question: 'Which warning applies?',
    choices: [
      'Deletion needs tombstones or reinsertion; this insert-only model does not pretend clearing a slot preserves lookup chains.',
      'Possible membership proves exact membership.',
      'Adding a ring node must move every key.',
    ],
    answer: 0,
    explanation:
      'Deletion needs tombstones or reinsertion; this insert-only model does not pretend clearing a slot preserves lookup chains.',
  },
];
export default quiz;
