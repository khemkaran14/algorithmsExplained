const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this demonstration?',
    choices: [
      'Encode the example as UTF-8 bytes.',
      'Use a public teaching private key for real production credentials.',
      'Bypass a failed authentication or certificate check.',
    ],
    answer: 0,
    explanation: 'Change one bit. Compare the whole digest.',
  },
  {
    id: 'cost',
    question: 'Which cost model is relevant?',
    choices: [
      'All real cryptography is constant time for unlimited input.',
      'O(n) input hashing and fixed-size digest state',
      'Animation duration proves a production security level.',
    ],
    answer: 1,
    explanation: 'O(n) input hashing and fixed-size digest state',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must you remember?',
    choices: [
      'A digest is not encryption. Avalanche examples do not prove preimage or collision resistance.',
      'A signature always hides its message.',
      'A hash avalanche example proves collision resistance.',
    ],
    answer: 0,
    explanation:
      'A digest is not encryption. Avalanche examples do not prove preimage or collision resistance.',
  },
];
export default quiz;
