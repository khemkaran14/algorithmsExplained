const quiz = [
  {
    id: 'complexity',
    question: 'Which bound or property applies to this demonstration?',
    choices: [
      'O(n) traversal',
      'Every operation is always O(n\u00b2).',
      'All storage is O(1), regardless of input.',
    ],
    answer: 0,
    explanation:
      'Traversal is linear in the encoded input. Materializing all code points takes linear space; repeatedly copying immutable prefixes can be quadratic.',
  },
  {
    id: 'invariant',
    question: 'Which rule must be preserved?',
    choices: [
      'Ignore empty and full states.',
      'Decode the sequence into Unicode code points.',
      'Treat equal values as the same node identity.',
    ],
    answer: 1,
    explanation: 'Decode the sequence into Unicode code points.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'JavaScript and Java use UTF-16. Python strings expose code points; C++ std::string is a byte container and needs explicit decoding. A code point is not always a visible character.',
      'A pointer structure always has constant-time key lookup.',
      'A code point always equals one visible character.',
    ],
    answer: 0,
    explanation:
      'JavaScript and Java use UTF-16. Python strings expose code points; C++ std::string is a byte container and needs explicit decoding. A code point is not always a visible character.',
  },
];
export default quiz;
