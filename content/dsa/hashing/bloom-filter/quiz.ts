const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this algorithm?',
    choices: [
      'Set k positions per inserted key.',
      'Skip equality checks whenever two hashes match.',
      'Use the animation duration as a CPU benchmark.',
    ],
    answer: 0,
    explanation:
      'An insert-only filter has no false negatives; shared bits create false positives. The animation includes an exact membership oracle solely to expose that distinction. Double hashing uses an odd step with a power-of-two bit count.',
  },
  {
    id: 'cost',
    question: 'Which cost model is appropriate?',
    choices: [
      'Every operation is always O(1).',
      'O(k) bit probes per operation and O(m) bits',
      'Hashing eliminates all collisions.',
    ],
    answer: 1,
    explanation:
      'An insert-only filter has no false negatives; shared bits create false positives. The animation includes an exact membership oracle solely to expose that distinction. Double hashing uses an odd step with a power-of-two bit count.',
  },
  {
    id: 'pitfall',
    question: 'Which warning applies?',
    choices: [
      'Never treat possible membership as proof. Clearing ordinary Bloom bits can create false negatives.',
      'Possible membership proves exact membership.',
      'Adding a ring node must move every key.',
    ],
    answer: 0,
    explanation:
      'Never treat possible membership as proof. Clearing ordinary Bloom bits can create false negatives.',
  },
];
export default quiz;
