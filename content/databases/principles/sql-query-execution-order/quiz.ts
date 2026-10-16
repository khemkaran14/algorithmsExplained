const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'The model evaluates FROM/JOIN/ON, then WHERE on individual rows, GROUP BY customer identity and name, HAVING on group totals, projection, ORDER BY total descending with deterministic ties, then LIMIT. A right-side minimum-amount WHERE removes NULL-extended LEFT rows before grouping. The example SUM ignores no additional NULLs because WHERE already removes them.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'The model evaluates FROM/JOIN/ON, then WHERE on individual rows, GROUP BY customer identity and name, HAVING on group totals, projection, ORDER BY total descending with deterministic ties, then LIMIT. A right-side minimum-amount WHERE removes NULL-extended LEFT rows before grouping. The example SUM ignores no additional NULLs because WHERE already removes them.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'Logical order specifies results; physical operators can be reordered when semantics remain equivalent. SELECT aliases, NULL ordering and collation vary by dialect. The model uses an explicit query with integer sums and a deterministic tie policy.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'Logical order specifies results; physical operators can be reordered when semantics remain equivalent. SELECT aliases, NULL ordering and collation vary by dialect. The model uses an explicit query with integer sums and a deterministic tie policy.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Change minimum amount, group total threshold and limit separately. Explain the difference between filtering order rows before SUM and filtering customer totals afterward.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
