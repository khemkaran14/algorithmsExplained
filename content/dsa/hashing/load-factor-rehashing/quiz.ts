const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this algorithm?',
    choices: [
      'Check projected load before insertion.',
      'Skip equality checks whenever two hashes match.',
      'Use the animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'Capacities grow as 2m+1, so total transfers across n insertions form a geometric series. This implementation grows before projected load exceeds 0.75.',
  },
  {
    id: 'cost',
    question: 'Which cost model is appropriate?',
    choices: [
      'Every operation is always O(1).',
      'Amortized expected O(1) insertion; O(n) one rehash',
      'Hashing eliminates all collisions.',
    ],
    answer: 1,
    explanation:
      'Capacities grow as 2m+1, so total transfers across n insertions form a geometric series. This implementation grows before projected load exceeds 0.75.',
  },
  {
    id: 'pitfall',
    question: 'Which warning applies?',
    choices: [
      'Copying buckets to the same indices is incorrect because modulo depends on capacity.',
      'Possible membership proves exact membership.',
      'Adding a ring node must move every key.',
    ],
    answer: 0,
    explanation:
      'Copying buckets to the same indices is incorrect because modulo depends on capacity.',
  },
];
export default quiz;
