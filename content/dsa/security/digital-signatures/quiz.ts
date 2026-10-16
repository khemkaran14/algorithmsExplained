const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this demonstration?',
    choices: [
      'Sign example bytes with the public RFC 8032 Ed25519 fixture.',
      'Use a public teaching private key for real production credentials.',
      'Bypass a failed authentication or certificate check.',
    ],
    answer: 0,
    explanation: 'Verify the exact bytes with a trusted public key.',
  },
  {
    id: 'cost',
    question: 'Which cost model is relevant?',
    choices: [
      'All real cryptography is constant time for unlimited input.',
      'O(n) message processing plus fixed-parameter curve operations',
      'Animation duration proves a production security level.',
    ],
    answer: 1,
    explanation:
      'O(n) message processing plus fixed-parameter curve operations',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must you remember?',
    choices: [
      'The fixture private key is deliberately public and must never be used for real signing. A valid signature does not establish who owns an untrusted key and does not encrypt the message.',
      'A signature always hides its message.',
      'A hash avalanche example proves collision resistance.',
    ],
    answer: 0,
    explanation:
      'The fixture private key is deliberately public and must never be used for real signing. A valid signature does not establish who owns an untrusted key and does not encrypt the message.',
  },
];
export default quiz;
