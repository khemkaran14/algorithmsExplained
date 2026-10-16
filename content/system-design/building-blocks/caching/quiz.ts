const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'Compare cache-aside, write-through and write-back with LRU capacity and TTL. Lose invalidation to expose stale versions, or crash a write-back cache before dirty values flush.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'Compare cache-aside, write-through and write-back with LRU capacity and TTL. Lose invalidation to expose stale versions, or crash a write-back cache before dirty values flush.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'A hit rate alone says nothing about freshness or durability. Real write-through partial failures need an additional protocol.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'A hit rate alone says nothing about freshness or durability. Real write-through partial failures need an additional protocol.',
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
