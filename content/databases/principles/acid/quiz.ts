const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Atomicity publishes the complete buffered write set or none after rollback. Consistency means preserving defined constraints and business invariants; transactions do not invent those rules. Isolation determines which concurrent histories can occur. Durability requires a durable commit/recovery protocol, explored separately in the WAL recovery lesson; in-memory publication alone does not establish it.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Atomicity publishes the complete buffered write set or none after rollback. Consistency means preserving defined constraints and business invariants; transactions do not invent those rules. Isolation determines which concurrent histories can occur. Durability requires a durable commit/recovery protocol, explored separately in the WAL recovery lesson; in-memory publication alone does not establish it.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'Do not confuse the C in ACID with replica consistency terminology, or call an in-memory simulator durable. This lesson\u2019s executable model covers atomic visibility and isolation; the linked WAL model executes durability/recovery decisions.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'Do not confuse the C in ACID with replica consistency terminology, or call an in-memory simulator durable. This lesson\u2019s executable model covers atomic visibility and isolation; the linked WAL model executes durability/recovery decisions.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Compare atomic rollback of two writes with snapshot write skew violating the at-least-one-active invariant. Change isolation and explain why durability still requires the recovery layer.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
