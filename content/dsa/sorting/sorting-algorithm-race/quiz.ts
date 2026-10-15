const quiz = [
  {
    id: 'complexity',
    question:
      'Which statement describes this lesson\u2019s cost or ordering property?',
    choices: [
      'Algorithm-dependent',
      'All inputs always take constant time.',
      'The input never changes the work.',
    ],
    answer: 0,
    explanation:
      'One visual tick is one generator frame, not a calibrated processor cycle. Counters explain work; wall-clock conclusions need benchmarks.',
  },
  {
    id: 'invariant',
    question: 'Which rule must the algorithm preserve?',
    choices: [
      'Discard duplicate keys.',
      'Compare the same input with the same measurement definition.',
      'Stop after the first comparison.',
    ],
    answer: 1,
    explanation: 'Compare the same input with the same measurement definition.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Every sort is stable.',
      'Do not compare algorithms on different inputs or interpret animation speed as a benchmark. Quick sort here uses a last-element Lomuto pivot.',
      'Animation duration is a reliable benchmark.',
    ],
    answer: 1,
    explanation:
      'Do not compare algorithms on different inputs or interpret animation speed as a benchmark. Quick sort here uses a last-element Lomuto pivot.',
  },
];
export default quiz;
