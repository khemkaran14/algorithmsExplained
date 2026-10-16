const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this demonstration?',
    choices: [
      'Exchange toy powers of public g modulo public p.',
      'Use a public teaching private key for real production credentials.',
      'Bypass a failed authentication or certificate check.',
    ],
    answer: 0,
    explanation: 'A shared secret still needs an authenticated peer.',
  },
  {
    id: 'cost',
    question: 'Which cost model is relevant?',
    choices: [
      'All real cryptography is constant time for unlimited input.',
      'O(log exponent) modular multiplications in the bounded toy',
      'Animation duration proves a production security level.',
    ],
    answer: 1,
    explanation: 'O(log exponent) modular multiplications in the bounded toy',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must you remember?',
    choices: [
      'The toy group p=23 is insecure. Real protocols use validated modern groups, authentication, a KDF and transcript binding.',
      'A signature always hides its message.',
      'A hash avalanche example proves collision resistance.',
    ],
    answer: 0,
    explanation:
      'The toy group p=23 is insecure. Real protocols use validated modern groups, authentication, a KDF and transcript binding.',
  },
];
export default quiz;
