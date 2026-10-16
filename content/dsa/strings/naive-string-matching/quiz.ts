const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this algorithm?',
    choices: [
      'Choose the next possible start index.',
      'Accept every equal hash as exact text equality.',
      'Discard all overlapping candidates without checking.',
    ],
    answer: 0,
    explanation: 'Try every alignment. Stop at the first mismatch.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every string operation is always constant time.',
      'O(nm) worst time and O(1) auxiliary space',
      'Animation duration is a calibrated CPU benchmark.',
    ],
    answer: 1,
    explanation: 'O(nm) worst time and O(1) auxiliary space',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'Do not skip overlapping occurrences or read beyond the final valid alignment.',
      'Every compressed output is smaller than its source.',
      'All language string indices always mean grapheme clusters.',
    ],
    answer: 0,
    explanation:
      'Do not skip overlapping occurrences or read beyond the final valid alignment.',
  },
];
export default quiz;
