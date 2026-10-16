const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Sort composite tuples lexicographically. Equality conditions on consecutive leftmost columns define a seek range found with lower and upper bounds. A filter only on a later column requires scanning in this baseline. Index coverage requires every projected and filtered column to be stored in the index, independently of seek selectivity.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Sort composite tuples lexicographically. Equality conditions on consecutive leftmost columns define a seek range found with lower and upper bounds. A filter only on a later column requires scanning in this baseline. Index coverage requires every projected and filtered column to be stored in the index, independently of seek selectivity.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'The model omits index skip scans, included columns, visibility maps and real buffer I/O. A covered SQL query may still need heap visibility checks in a real MVCC engine. The player builds a teaching index once per scenario, not a production index per query.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'The model omits index skip scans, included columns, visibility maps and real buffer I/O. A covered SQL query may still need heap visibility checks in a real MVCC engine. The player builds a teaching index once per scenario, not a production index per query.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Filter tenant using index (tenant,created), then filter only created. Compare a covered projection with one requesting amount and inspect candidate rows and heap fetches.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
