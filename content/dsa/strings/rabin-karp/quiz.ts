const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this algorithm?',
    choices: [
      'Hash the pattern and first window.',
      'Accept every equal hash as exact text equality.',
      'Discard all overlapping candidates without checking.',
    ],
    answer: 0,
    explanation: 'Filter by a rolling hash, then verify.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every string operation is always constant time.',
      'O(n+m) expected, O(nm) worst, O(1) auxiliary space',
      'Animation duration is a calibrated CPU benchmark.',
    ],
    answer: 1,
    explanation: 'O(n+m) expected, O(nm) worst, O(1) auxiliary space',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'Hash collisions are possible. This model always verifies candidates and uses safe integer arithmetic under its bounded inputs.',
      'Every compressed output is smaller than its source.',
      'All language string indices always mean grapheme clusters.',
    ],
    answer: 0,
    explanation:
      'Hash collisions are possible. This model always verifies candidates and uses safe integer arithmetic under its bounded inputs.',
  },
];
export default quiz;
