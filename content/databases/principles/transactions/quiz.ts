const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'BEGIN creates a transaction identity, reads observe visible committed versions plus the transaction\u2019s own writes, and writes accumulate privately. COMMIT publishes the complete write set atomically after conflict checks. ROLLBACK discards the private set. The model ends transaction IDs rather than silently reusing them.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'BEGIN creates a transaction identity, reads observe visible committed versions plus the transaction\u2019s own writes, and writes accumulate privately. COMMIT publishes the complete write set atomically after conflict checks. ROLLBACK discards the private set. The model ends transaction IDs rather than silently reusing them.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'This model uses deferred absolute writes, not a full SQL executor or SQL UPDATE arithmetic. Production transactions also need physical locks, persistence and recovery. A business invariant across rows is not enforced merely by placing operations between BEGIN and COMMIT.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'This model uses deferred absolute writes, not a full SQL executor or SQL UPDATE arithmetic. Production transactions also need physical locks, persistence and recovery. A business invariant across rows is not enforced merely by placing operations between BEGIN and COMMIT.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Write both x and y, read an own write, then roll back and inspect another transaction\u2019s view. Compare a successful commit with a snapshot write-conflict abort.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
