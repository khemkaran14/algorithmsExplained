const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this algorithm?',
    choices: [
      'Compare the next character with the active run.',
      'Accept every equal hash as exact text equality.',
      'Discard all overlapping candidates without checking.',
    ],
    answer: 0,
    explanation: 'Count equal neighbors, not equal characters everywhere.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every string operation is always constant time.',
      'O(n) time and O(r) output runs',
      'Animation duration is a calibrated CPU benchmark.',
    ],
    answer: 1,
    explanation: 'O(n) time and O(r) output runs',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'Alternating data may expand. Explicit pairs avoid ambiguity when the source itself contains digits.',
      'Every compressed output is smaller than its source.',
      'All language string indices always mean grapheme clusters.',
    ],
    answer: 0,
    explanation:
      'Alternating data may expand. Explicit pairs avoid ambiguity when the source itself contains digits.',
  },
];
export default quiz;
