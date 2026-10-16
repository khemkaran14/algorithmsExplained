const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'The two-replica model compares synchronous agreement, delayed asynchronous delivery and session-token waits. Partition/healing shows the consequences of local writes and the declared logical conflict rule.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'The two-replica model compares synchronous agreement, delayed asynchronous delivery and session-token waits. Partition/healing shows the consequences of local writes and the declared logical conflict rule.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'This abstract register permits local writes in eventual mode. It is not a full single-primary database, consensus log or conflict-free multi-object transaction system.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'This abstract register permits local writes in eventual mode. It is not a full single-primary database, consensus log or conflict-free multi-object transaction system.',
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
