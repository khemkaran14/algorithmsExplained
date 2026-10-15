const quiz = [
  {
    id: 'complexity',
    question:
      'Which statement describes this lesson\u2019s cost or ordering property?',
    choices: [
      'O(n + k)',
      'All inputs always take constant time.',
      'The input never changes the work.',
    ],
    answer: 0,
    explanation:
      'The work is O(n+k), where k is the key range. A huge sparse range can cost more than a comparison sort.',
  },
  {
    id: 'invariant',
    question: 'Which rule must the algorithm preserve?',
    choices: [
      'Discard duplicate keys.',
      'Scan the key range as well as the input.',
      'Stop after the first comparison.',
    ],
    answer: 1,
    explanation: 'Scan the key range as well as the input.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Every sort is stable.',
      'This frequency-output variant sorts keys but does not demonstrate stable payload placement. A stable record sort needs prefix offsets and an output array.',
      'Animation duration is a reliable benchmark.',
    ],
    answer: 1,
    explanation:
      'This frequency-output variant sorts keys but does not demonstrate stable payload placement. A stable record sort needs prefix offsets and an output array.',
  },
];
export default quiz;
