const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Committed versions retain a value, commit version and writer. Snapshot reads select the newest version no later than their snapshot; read-committed reads use the current commit version. Private writes remain visible only to their own transaction until publication. The version chains make old and new values inspectable.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Committed versions retain a value, commit version and writer. Snapshot reads select the newest version no later than their snapshot; read-committed reads use the current commit version. Private writes remain visible only to their own transaction until publication. The version chains make old and new values inspectable.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'MVCC is not lock-free and is not the same as serializability. Real engines track tuple visibility and transaction states, reclaim old versions with vacuum, and coordinate writes and crash recovery. This two-key model retains all versions and performs linear scans for clarity.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'MVCC is not lock-free and is not the same as serializability. Real engines track tuple visibility and transaction states, reclaim old versions with vacuum, and coordinate writes and crash recovery. This two-key model retains all versions and performs linear scans for clarity.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Read x, commit a new x from the other transaction, then read x again under both policies. Explain why the retained old version is needed for one reader and why an aborted write never enters the committed chain.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
