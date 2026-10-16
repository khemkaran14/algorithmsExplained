const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Owner documents embed the owner\u2019s order records. Key-value access uses explicit record keys and optionally maintained owner references. Wide-column layout groups by owner and sorts by created time so binary bounds restrict an interval. Graph layout builds directed adjacency and uses deduplicated breadth-first neighborhood expansion. Remaining amount/time predicates still require filtering.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Owner documents embed the owner\u2019s order records. Key-value access uses explicit record keys and optionally maintained owner references. Wide-column layout groups by owner and sorts by created time so binary bounds restrict an interval. Graph layout builds directed adjacency and uses deduplicated breadth-first neighborhood expansion. Remaining amount/time predicates still require filtering.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'These are explicit read-only fixtures, not a claim that every product has identical APIs. Large embedded documents, hot partitions, manual index consistency, graph fan-out, distributed transaction boundaries and product limits need separate design. The player constructs all fixture layouts for comparison.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'These are explicit read-only fixtures, not a claim that every product has identical APIs. Large embedded documents, hot partitions, manual index consistency, graph fan-out, distributed transaction boundaries and product limits need separate design. The player constructs all fixture layouts for comparison.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Compare the same query under every layout. Add a friendship cycle and bound traversal depth. Narrow the created interval, then ask for a nonlocal predicate and discuss the index or scan work it introduces.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
