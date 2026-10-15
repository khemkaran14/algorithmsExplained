const quiz = [
  {
    id: 'complexity',
    question: 'Which cost description applies here?',
    choices: ['O(log n)', 'O(1) for every input', 'O(n!) for every input'],
    answer: 0,
    explanation:
      'A target near position i needs O(log(i+1)) probes, capped at O(log n) for a finite array.',
  },
  {
    id: 'invariant',
    question: 'Which step is essential?',
    choices: [
      'Ignore array boundaries.',
      'Check the first position.',
      'Sort by discarding duplicate keys.',
    ],
    answer: 1,
    explanation: 'Check the first position.',
  },
  {
    id: 'pitfall',
    question: 'Which warning should you remember?',
    choices: [
      'Clamp every doubling bound before indexing a finite array. The binary phase must include both ends of the bracket.',
      'Every target must be present.',
      'An animation frame is a processor cycle.',
    ],
    answer: 0,
    explanation:
      'Clamp every doubling bound before indexing a finite array. The binary phase must include both ends of the bracket.',
  },
];
export default quiz;
