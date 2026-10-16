const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Distinguish rows, columns, domains, primary keys, candidate keys and foreign keys. The example enforces Customer.id and Order.id uniqueness and validates every non-null Order.customerId. NULL represents an optional relationship; it does not equal a missing customer.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Distinguish rows, columns, domains, primary keys, candidate keys and foreign keys. The example enforces Customer.id and Order.id uniqueness and validates every non-null Order.customerId. NULL represents an optional relationship; it does not equal a missing customer.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'Database constraints are the concurrency-safe authority. A prior application SELECT cannot enforce uniqueness under a race. Candidate keys are minimal unique determinants; a surrogate primary key does not remove business uniqueness requirements.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'Database constraints are the concurrency-safe authority. A prior application SELECT cannot enforce uniqueness under a race. Candidate keys are minimal unique determinants; a surrogate primary key does not remove business uniqueness requirements.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Add a duplicate ID and a non-null orphan, then compare enabled constraints with the explicit unsafe experiment. NULL foreign keys remain allowed.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
