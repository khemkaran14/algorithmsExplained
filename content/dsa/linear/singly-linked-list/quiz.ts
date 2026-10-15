const quiz = [
  {
    id: 'complexity',
    question: 'Which bound or property applies to this demonstration?',
    choices: [
      'O(n) key lookup',
      'Every operation is always O(n\u00b2).',
      'All storage is O(1), regardless of input.',
    ],
    answer: 0,
    explanation:
      'Appending with a tail pointer is O(1). Searching by key is O(n); deleting after a known predecessor is O(1).',
  },
  {
    id: 'invariant',
    question: 'Which rule must be preserved?',
    choices: [
      'Ignore empty and full states.',
      'Keep head and tail node identities.',
      'Treat equal values as the same node identity.',
    ],
    answer: 1,
    explanation: 'Keep head and tail node identities.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Deleting the head or final node requires updating end pointers. Equal values still belong to distinct nodes.',
      'A pointer structure always has constant-time key lookup.',
      'A code point always equals one visible character.',
    ],
    answer: 0,
    explanation:
      'Deleting the head or final node requires updating end pointers. Equal values still belong to distinct nodes.',
  },
];
export default quiz;
