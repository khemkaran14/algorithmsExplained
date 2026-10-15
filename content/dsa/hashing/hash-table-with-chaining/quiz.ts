const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this algorithm?',
    choices: [
      'Normalize negative key remainders.',
      'Skip equality checks whenever two hashes match.',
      'Use the animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'The load factor \u03b1=n/m describes the average chain length, assuming reasonably distributed hashes. The demonstration uses set semantics.',
  },
  {
    id: 'cost',
    question: 'Which cost model is appropriate?',
    choices: [
      'Every operation is always O(1).',
      'Expected O(1+\u03b1) lookup, worst O(n), O(n+m) space',
      'Hashing eliminates all collisions.',
    ],
    answer: 1,
    explanation:
      'The load factor \u03b1=n/m describes the average chain length, assuming reasonably distributed hashes. The demonstration uses set semantics.',
  },
  {
    id: 'pitfall',
    question: 'Which warning applies?',
    choices: [
      'Do not remove an entire bucket when deleting one colliding key.',
      'Possible membership proves exact membership.',
      'Adding a ring node must move every key.',
    ],
    answer: 0,
    explanation:
      'Do not remove an entire bucket when deleting one colliding key.',
  },
];
export default quiz;
