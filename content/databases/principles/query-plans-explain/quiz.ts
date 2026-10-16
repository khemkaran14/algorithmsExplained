const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Compare a sequential page scan with an index range plus possible heap fetches. The model uses four entries per page, an abstract seek cost and a random-heap-fetch cost of two work units. Auto chooses the cheaper estimated access plan. Execute the chosen plan against actual rows and compare estimated candidate selectivity with the observed work.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Compare a sequential page scan with an index range plus possible heap fetches. The model uses four entries per page, an abstract seek cost and a random-heap-fetch cost of two work units. Auto chooses the cheaper estimated access plan. Execute the chosen plan against actual rows and compare estimated candidate selectivity with the observed work.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'This is an explicit cost-estimation exercise, not parsed PostgreSQL EXPLAIN output. Actual EXPLAIN plans need real statistics, operator details and buffers; EXPLAIN ANALYZE executes a statement. Never apply it carelessly to a mutating production query.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'This is an explicit cost-estimation exercise, not parsed PostgreSQL EXPLAIN output. Actual EXPLAIN plans need real statistics, operator details and buffers; EXPLAIN ANALYZE executes a statement. Never apply it carelessly to a mutating production query.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Change estimated selectivity while keeping data fixed. Force sequential and index plans and compare outputs as bags; costs may differ while the query results remain equivalent.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
