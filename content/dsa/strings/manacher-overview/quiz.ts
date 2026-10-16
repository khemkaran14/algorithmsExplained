const quiz = [
  {
    id: 'invariant',
    question: 'Which step belongs to this algorithm?',
    choices: [
      'Track the rightmost palindrome box.',
      'Accept every equal hash as exact text equality.',
      'Discard all overlapping candidates without checking.',
    ],
    answer: 0,
    explanation: 'Mirror known palindromes before expanding.',
  },
  {
    id: 'cost',
    question: 'Which cost model applies here?',
    choices: [
      'Every string operation is always constant time.',
      'O(n) time and O(n) space',
      'Animation duration is a calibrated CPU benchmark.',
    ],
    answer: 1,
    explanation: 'O(n) time and O(n) space',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'Odd and even centers have different mirror formulas. The empty-input case is excluded by this lesson\u2019s input contract.',
      'Every compressed output is smaller than its source.',
      'All language string indices always mean grapheme clusters.',
    ],
    answer: 0,
    explanation:
      'Odd and even centers have different mirror formulas. The empty-input case is excluded by this lesson\u2019s input contract.',
  },
];
export default quiz;
