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
      'The comparison count stays quadratic even for a sorted input. Only at most n\u22121 swaps are needed.',
  },
  {
    id: 'invariant',
    question: 'Which rule must the algorithm preserve?',
    choices: [
      'Discard duplicate keys.',
      'Scan the entire remaining suffix.',
      'Stop after the first comparison.',
    ],
    answer: 1,
    explanation: 'Scan the entire remaining suffix.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Every sort is stable.',
      'Swapping a distant minimum can reorder equal-key records; this version is not stable.',
      'Animation duration is a reliable benchmark.',
    ],
    answer: 1,
    explanation:
      'Swapping a distant minimum can reorder equal-key records; this version is not stable.',
  },
];
export default quiz;
