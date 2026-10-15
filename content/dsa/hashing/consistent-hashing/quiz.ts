const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this algorithm?',
    choices: [
      'Hash virtual server tokens onto a ring.',
      'Skip equality checks whenever two hashes match.',
      'Use the animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'Virtual tokens improve balance without guaranteeing it for tiny samples. Adding a server moves keys to that server; removing one moves only its former keys. The teaching hash is reproducible, not adversarially secure.',
  },
  {
    id: 'cost',
    question: 'Which cost model is appropriate?',
    choices: [
      'Every operation is always O(1).',
      'O(log v) lookup after sorting v virtual tokens',
      'Hashing eliminates all collisions.',
    ],
    answer: 1,
    explanation:
      'Virtual tokens improve balance without guaranteeing it for tiny samples. Adding a server moves keys to that server; removing one moves only its former keys. The teaching hash is reproducible, not adversarially secure.',
  },
  {
    id: 'pitfall',
    question: 'Which warning applies?',
    choices: [
      'Ownership is separate from replication, durability, failure detection and consistency. Modulo node count is a different placement scheme.',
      'Possible membership proves exact membership.',
      'Adding a ring node must move every key.',
    ],
    answer: 0,
    explanation:
      'Ownership is separate from replication, durability, failure detection and consistency. Modulo node count is a different placement scheme.',
  },
];
export default quiz;
