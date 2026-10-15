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
      'Balanced partitions give O(n log n) expected work, while repeated extreme pivots give O(n\u00b2).',
  },
  {
    id: 'invariant',
    question: 'Which rule must the algorithm preserve?',
    choices: [
      'Discard duplicate keys.',
      'Only recurse on intervals that exclude the fixed pivot.',
      'Stop after the first comparison.',
    ],
    answer: 1,
    explanation: 'Only recurse on intervals that exclude the fixed pivot.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Every sort is stable.',
      'This default is Lomuto with a last-element pivot. Sorted or equal-valued inputs can be adversarial; do not confuse Hoare return boundaries with pivot positions.',
      'Animation duration is a reliable benchmark.',
    ],
    answer: 1,
    explanation:
      'This default is Lomuto with a last-element pivot. Sorted or equal-valued inputs can be adversarial; do not confuse Hoare return boundaries with pivot positions.',
  },
];
export default quiz;
