const quiz = [
  {
    id: 'complexity',
    question:
      'Which statement describes this lesson\u2019s cost or ordering property?',
    choices: [
      'O(n\u00b2)',
      'All inputs always take constant time.',
      'The input never changes the work.',
    ],
    answer: 0,
    explanation:
      'Shell sort depends on its gap sequence. Integer-halving gaps have a quadratic worst-case bound.',
  },
  {
    id: 'invariant',
    question: 'Which rule must the algorithm preserve?',
    choices: [
      'Discard duplicate keys.',
      'Finish with a gap of one.',
      'Stop after the first comparison.',
    ],
    answer: 1,
    explanation: 'Finish with a gap of one.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Every sort is stable.',
      'Bounds depend on the gap sequence; do not claim a universal O(n log n) worst case.',
      'Animation duration is a reliable benchmark.',
    ],
    answer: 1,
    explanation:
      'Bounds depend on the gap sequence; do not claim a universal O(n log n) worst case.',
  },
];
export default quiz;
