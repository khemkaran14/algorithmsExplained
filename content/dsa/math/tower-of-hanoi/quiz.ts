const quiz = [
  {
    id: 'complexity',
    question: 'Which cost or quantity applies here?',
    choices: [
      '2\u207f\u22121 moves',
      'O(1) for every possible unbounded workload',
      'The number of animations is a calibrated CPU time.',
    ],
    answer: 0,
    explanation:
      'The optimal canonical three-peg plan has exactly 2\u207f\u22121 moves and O(n) recursion depth. The interactive trace is capped at eight disks.',
  },
  {
    id: 'invariant',
    question: 'Which step preserves the intended result?',
    choices: [
      'Ignore edge conditions.',
      'Move n\u22121 disks from source to auxiliary.',
      'Always keep the first result regardless of later input.',
    ],
    answer: 1,
    explanation: 'Move n\u22121 disks from source to auxiliary.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation should you remember?',
    choices: [
      'A legal board must keep larger disks below smaller ones. Even an efficient generator cannot avoid the exponentially many required moves.',
      'Every randomized result is cryptographically secure.',
      'A converged clustering must be globally optimal.',
    ],
    answer: 0,
    explanation:
      'A legal board must keep larger disks below smaller ones. Even an efficient generator cannot avoid the exponentially many required moves.',
  },
];
export default quiz;
