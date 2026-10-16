const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this algorithm?',
    choices: [
      'Build the longest proper-prefix/suffix table.',
      'Accept every equal hash as exact text equality.',
      'Discard all overlapping candidates without checking.',
    ],
    answer: 0,
    explanation: 'A mismatch can preserve a matching prefix.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every string operation is always constant time.',
      'O(n+m) time and O(m) auxiliary space',
      'Animation duration is a calibrated CPU benchmark.',
    ],
    answer: 1,
    explanation: 'O(n+m) time and O(m) auxiliary space',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'Fallback uses prefix[j\u22121], and a full match must preserve overlapping candidates.',
      'Every compressed output is smaller than its source.',
      'All language string indices always mean grapheme clusters.',
    ],
    answer: 0,
    explanation:
      'Fallback uses prefix[j\u22121], and a full match must preserve overlapping candidates.',
  },
];
export default quiz;
