const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this demonstration?',
    choices: [
      'Publish toy n=3233 and e=17.',
      'Use a public teaching private key for real production credentials.',
      'Bypass a failed authentication or certificate check.',
    ],
    answer: 0,
    explanation: 'A public operation and a private inverse.',
  },
  {
    id: 'cost',
    question: 'Which cost model is relevant?',
    choices: [
      'All real cryptography is constant time for unlimited input.',
      'O(log exponent) modular multiplications, excluding big-integer bit cost',
      'Animation duration proves a production security level.',
    ],
    answer: 1,
    explanation:
      'O(log exponent) modular multiplications, excluding big-integer bit cost',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must you remember?',
    choices: [
      'The tiny published key and deterministic unpadded RSA are insecure. These four reference snippets are toy arithmetic only.',
      'A signature always hides its message.',
      'A hash avalanche example proves collision resistance.',
    ],
    answer: 0,
    explanation:
      'The tiny published key and deterministic unpadded RSA are insecure. These four reference snippets are toy arithmetic only.',
  },
];
export default quiz;
