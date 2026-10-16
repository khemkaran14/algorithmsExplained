const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'Compare stable virtual-token successors with modulo and recomputed fixed-range placement after adding a physical shard. Count actual changed owners and sampled shard skew.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'Compare stable virtual-token successors with modulo and recomputed fixed-range placement after adding a physical shard. Count actual changed owners and sampled shard skew.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'Consistent placement is separate from replication and online migration. Small samples, hot keys and failure correlation can still produce severe imbalance.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'Consistent placement is separate from replication and online migration. Small samples, hot keys and failure correlation can still produce severe imbalance.',
  },
  {
    id: 'practice',
    question: 'How should you test a proposed design?',
    choices: [
      'Change one assumption and check the state/accounting invariants.',
      'Judge it only by the number of boxes.',
      'Treat illustrative capacities as universal cloud benchmarks.',
    ],
    answer: 0,
    explanation:
      'A useful model makes its assumptions and consequences explicit; production measurements and full protocol validation remain necessary.',
  },
];
export default quiz;
