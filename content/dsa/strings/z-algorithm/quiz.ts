const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this algorithm?',
    choices: [
      'Join pattern, an unavailable separator and text.',
      'Accept every equal hash as exact text equality.',
      'Discard all overlapping candidates without checking.',
    ],
    answer: 0,
    explanation: 'Reuse a known matching prefix box.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every string operation is always constant time.',
      'O(n+m) time and O(n+m) space',
      'Animation duration is a calibrated CPU benchmark.',
    ],
    answer: 1,
    explanation: 'O(n+m) time and O(n+m) space',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'The separator must not appear in either input. This model reserves a null character and accepts printable ASCII only.',
      'Every compressed output is smaller than its source.',
      'All language string indices always mean grapheme clusters.',
    ],
    answer: 0,
    explanation:
      'The separator must not appear in either input. This model reserves a null character and accepts printable ASCII only.',
  },
];
export default quiz;
