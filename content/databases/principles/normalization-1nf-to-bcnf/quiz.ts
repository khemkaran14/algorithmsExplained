const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Start with atomic domains for 1NF. Compute attribute closure by repeatedly applying asserted functional dependencies. Enumerate all minimal candidate keys, then mark every attribute that appears in a candidate key as prime. 2NF forbids non-prime attributes depending on a proper subset of a candidate key. 3NF permits a nontrivial dependency when its determinant is a superkey or the dependent attribute is prime. BCNF requires a superkey determinant for every nontrivial dependency.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Start with atomic domains for 1NF. Compute attribute closure by repeatedly applying asserted functional dependencies. Enumerate all minimal candidate keys, then mark every attribute that appears in a candidate key as prime. 2NF forbids non-prime attributes depending on a proper subset of a candidate key. 3NF permits a nontrivial dependency when its determinant is a superkey or the dependent attribute is prime. BCNF requires a superkey determinant for every nontrivial dependency.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'Dependencies are domain rules, not coincidences in sample rows. A lossless BCNF split need not preserve every dependency locally. The player demonstrates one split and its shared-determinant lossless condition; it does not claim a complete dependency-preserving decomposition.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'Dependencies are domain rules, not coincidences in sample rows. A lossless BCNF split need not preserve every dependency locally. The player demonstrates one split and its shared-determinant lossless condition; it does not claim a complete dependency-preserving decomposition.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Use AB \u2192 C and C \u2192 B on relation ABC. Candidate keys AB and AC make every attribute prime: 3NF holds, but C is not a superkey, so BCNF fails. Compare A \u2192 B and B \u2192 C, then inspect the first lossless split.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
