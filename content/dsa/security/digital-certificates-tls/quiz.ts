const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this demonstration?',
    choices: [
      'Load the public offline certificate chain.',
      'Use a public teaching private key for real production credentials.',
      'Bypass a failed authentication or certificate check.',
    ],
    answer: 0,
    explanation: 'Trust is a chain of checks, not a padlock drawing.',
  },
  {
    id: 'cost',
    question: 'Which cost model is relevant?',
    choices: [
      'All real cryptography is constant time for unlimited input.',
      'O(k) modeled chain checks plus signature verification',
      'Animation duration proves a production security level.',
    ],
    answer: 1,
    explanation: 'O(k) modeled chain checks plus signature verification',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must you remember?',
    choices: [
      'This offline model does not simulate a full handshake or check revocation, name constraints or every PKIX policy. It is a selected-check illustration, not a production certificate validator.',
      'A signature always hides its message.',
      'A hash avalanche example proves collision resistance.',
    ],
    answer: 0,
    explanation:
      'This offline model does not simulate a full handshake or check revocation, name constraints or every PKIX policy. It is a selected-check illustration, not a production certificate validator.',
  },
];
export default quiz;
