const quiz = [
  {
    id: 'complexity',
    question:
      'Which statement describes this lesson\u2019s cost or ordering property?',
    choices: [
      'O(d(n + b))',
      'All inputs always take constant time.',
      'The input never changes the work.',
    ],
    answer: 0,
    explanation:
      'For d digits and base b, stable digit passes cost O(d(n+b)) time and O(n+b) extra space.',
  },
  {
    id: 'invariant',
    question: 'Which rule must the algorithm preserve?',
    choices: [
      'Discard duplicate keys.',
      'Every digit pass must preserve the earlier digit order.',
      'Stop after the first comparison.',
    ],
    answer: 1,
    explanation: 'Every digit pass must preserve the earlier digit order.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Every sort is stable.',
      'An unstable digit pass destroys the ordering established by earlier passes. Signed inputs need deliberate handling.',
      'Animation duration is a reliable benchmark.',
    ],
    answer: 1,
    explanation:
      'An unstable digit pass destroys the ordering established by earlier passes. Signed inputs need deliberate handling.',
  },
];
export default quiz;
