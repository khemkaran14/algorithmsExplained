const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this demonstration?',
    choices: [
      'Use the public deterministic teaching fixture.',
      'Use a public teaching private key for real production credentials.',
      'Bypass a failed authentication or certificate check.',
    ],
    answer: 0,
    explanation: 'Authenticate before releasing plaintext.',
  },
  {
    id: 'cost',
    question: 'Which cost model is relevant?',
    choices: [
      'All real cryptography is constant time for unlimited input.',
      'O(n) encryption/decryption and O(n) returned buffers',
      'Animation duration proves a production security level.',
    ],
    answer: 1,
    explanation: 'O(n) encryption/decryption and O(n) returned buffers',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must you remember?',
    choices: [
      'The interactive key and nonces are intentionally public fixtures. Production code below uses a fresh random nonce; reusing a nonce under one GCM key breaks security.',
      'A signature always hides its message.',
      'A hash avalanche example proves collision resistance.',
    ],
    answer: 0,
    explanation:
      'The interactive key and nonces are intentionally public fixtures. Production code below uses a fresh random nonce; reusing a nonce under one GCM key breaks security.',
  },
];
export default quiz;
