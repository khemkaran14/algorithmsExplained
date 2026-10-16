const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this demonstration?',
    choices: [
      'Derive bytes with actual scrypt.',
      'Use a public teaching private key for real production credentials.',
      'Bypass a failed authentication or certificate check.',
    ],
    answer: 0,
    explanation: 'Spend work per guess and keep salts unique.',
  },
  {
    id: 'cost',
    question: 'Which cost model is relevant?',
    choices: [
      'All real cryptography is constant time for unlimited input.',
      'O(Nrp) KDF work and O(Nr) memory',
      'Animation duration proves a production security level.',
    ],
    answer: 1,
    explanation: 'O(Nrp) KDF work and O(Nr) memory',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must you remember?',
    choices: [
      'Do not enter real passwords. Interactive costs and salts are small public teaching fixtures. Production references use stronger parameters that still need calibration; Java demonstrates PBKDF2 as a distinct standard-library alternative.',
      'A signature always hides its message.',
      'A hash avalanche example proves collision resistance.',
    ],
    answer: 0,
    explanation:
      'Do not enter real passwords. Interactive costs and salts are small public teaching fixtures. Production references use stronger parameters that still need calibration; Java demonstrates PBKDF2 as a distinct standard-library alternative.',
  },
];
export default quiz;
