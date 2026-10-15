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
      'Heap construction is O(n), followed by n extractions costing O(log n) each.',
  },
  {
    id: 'invariant',
    question: 'Which rule must the algorithm preserve?',
    choices: [
      'Discard duplicate keys.',
      'Restore heap order only inside the active heap.',
      'Stop after the first comparison.',
    ],
    answer: 1,
    explanation: 'Restore heap order only inside the active heap.',
  },
  {
    id: 'pitfall',
    question: 'Which warning is correct?',
    choices: [
      'Every sort is stable.',
      'Children at 2i+1 and 2i+2 must remain inside the active heap, not the full backing array.',
      'Animation duration is a reliable benchmark.',
    ],
    answer: 1,
    explanation:
      'Children at 2i+1 and 2i+2 must remain inside the active heap, not the full backing array.',
  },
];
export default quiz;
