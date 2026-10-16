const quiz = [
  {
    id: 'mechanism',
    question: 'Does rewrap require changing the payload ciphertext?',
    choices: [
      'No, only the wrapped data key changes',
      'Yes, every payload byte must be re-encrypted',
      'No, because the wrapping key is public in production',
    ],
    answer: 0,
    explanation:
      'Each record has a data key for its AES-256-GCM payload. A versioned key-encryption key wraps that data key with record/version associated data. Rotation changes the active KEK; old records still depend on their old wrapping key until rewrap. Rewrap retains the data key and payload ciphertext. Administration and decrypt permissions are separate.',
  },
  {
    id: 'evidence',
    question: 'Which evidence best tests this lesson\u2019s design assumption?',
    choices: [
      'Change one declared workload or failure parameter and explain the resulting state.',
      'Treat the provider label as proof of correctness.',
      'Assume a clean diagram means production is healthy.',
    ],
    answer: 0,
    explanation:
      'Store, rotate and read without disabling the old key. Rewrap, disable the old key and read again. Tamper with a payload tag or wrapped key and verify authentication fails before plaintext is returned.',
  },
  {
    id: 'scope',
    question: 'What does running this exercise do?',
    choices: [
      'Provision the named cloud resources.',
      'Advance a bounded local model; validate real service behavior separately.',
      'Guarantee provider uptime and current pricing.',
    ],
    answer: 1,
    explanation:
      'The visualizer uses PUBLIC deterministic teaching keys and nonces: never use it for secrets. Explicit version disable maps separate KEKs/GCP-style versions, not identical AWS automatic-rotation controls. No cloud KMS is contacted.',
  },
];
export default quiz;
