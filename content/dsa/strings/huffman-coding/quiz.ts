const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this algorithm?',
    choices: [
      'Count each symbol frequency.',
      'Accept every equal hash as exact text equality.',
      'Discard all overlapping candidates without checking.',
    ],
    answer: 0,
    explanation: 'Give common symbols shorter paths.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every string operation is always constant time.',
      'O(n+\u03c3 log \u03c3) time and O(\u03c3) tree/codebook space',
      'Animation duration is a calibrated CPU benchmark.',
    ],
    answer: 1,
    explanation:
      'O(n+\u03c3 log \u03c3) time and O(\u03c3) tree/codebook space',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'Payload bit savings exclude codebook overhead. A single-symbol alphabet uses code zero in this model.',
      'Every compressed output is smaller than its source.',
      'All language string indices always mean grapheme clusters.',
    ],
    answer: 0,
    explanation:
      'Payload bit savings exclude codebook overhead. A single-symbol alphabet uses code zero in this model.',
  },
];
export default quiz;
