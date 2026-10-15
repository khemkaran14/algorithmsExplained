const quiz = [
  {
    id: 'complexity',
    question:
      'Which statement describes this lesson\u2019s cost or ordering property?',
    choices: [
      'O(n log n)',
      'All inputs always take constant time.',
      'The input never changes the work.',
    ],
    answer: 0,
    explanation:
      'This teaching model combines run detection, stable insertion and balanced adjacent merges. Production TimSort adds run-stack invariants and galloping.',
  },
  {
    id: 'invariant',
    question: 'Which rule must the algorithm preserve?',
    choices: [
      'Discard duplicate keys.',
      'Exploit natural runs before doing more sorting work.',
      'Stop after the first comparison.',
    ],
    answer: 1,
    explanation: 'Exploit natural runs before doing more sorting work.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Every sort is stable.',
      'This is an overview model, not a reimplementation of CPython or Java TimSort. Descending detection must be strict to preserve equal-key stability.',
      'Animation duration is a reliable benchmark.',
    ],
    answer: 1,
    explanation:
      'This is an overview model, not a reimplementation of CPython or Java TimSort. Descending detection must be strict to preserve equal-key stability.',
  },
];
export default quiz;
