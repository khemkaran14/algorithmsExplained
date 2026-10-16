const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Read committed selects the latest committed version for each read. Repeatable read takes its snapshot at the first data operation and rejects a concurrent conflicting write to the same key, but disjoint writes can still create write skew. Serializable adds an explicit serialization-graph cycle check in this bounded model. PostgreSQL READ UNCOMMITTED behaves as READ COMMITTED.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Read committed selects the latest committed version for each read. Repeatable read takes its snapshot at the first data operation and rejects a concurrent conflicting write to the same key, but disjoint writes can still create write skew. Serializable adds an explicit serialization-graph cycle check in this bounded model. PostgreSQL READ UNCOMMITTED behaves as READ COMMITTED.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'The graph check is not PostgreSQL SSI internals and omits predicate/phantom reads. Snapshot acquisition happens on first data access, not BEGIN. Independent PostgreSQL tests reproduce non-dirty reads, join semantics and the cross-row write-skew contrast.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'The graph check is not PostgreSQL SSI internals and omits predicate/phantom reads. Snapshot acquisition happens on first data access, not BEGIN. Independent PostgreSQL tests reproduce non-dirty reads, join semantics and the cross-row write-skew contrast.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Start with x=y=1 and the rule that at least one must stay 1. Both transactions read both keys, then one clears x and the other clears y. Compare repeatable read with serializable and inspect the aborted transaction. Also compare two reads around another transaction\u2019s commit.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
