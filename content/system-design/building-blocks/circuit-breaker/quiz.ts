const quiz = [
  {
    id: 'mechanism',
    question: 'Which mechanism is modeled here?',
    choices: [
      'Consecutive real call failures open the breaker. Calls during cooldown short-circuit without consuming a dependency outcome. A half-open serial probe closes on success or reopens on failure.',
      'A diagram alone provides the protocol guarantee.',
      'Every repeated request must always create another business effect.',
    ],
    answer: 0,
    explanation:
      'Consecutive real call failures open the breaker. Calls during cooldown short-circuit without consuming a dependency outcome. A half-open serial probe closes on success or reopens on failure.',
  },
  {
    id: 'limitation',
    question: 'Which limitation is important?',
    choices: [
      'Real failure assumptions never matter.',
      'This is a serial consecutive-failure breaker; rolling error windows and concurrent probe coordination are separate policies.',
      'Every queue provides exactly-once external side effects.',
    ],
    answer: 1,
    explanation:
      'This is a serial consecutive-failure breaker; rolling error windows and concurrent probe coordination are separate policies.',
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
