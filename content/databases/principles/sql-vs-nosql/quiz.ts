const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Run the same owner/neighborhood/time-range query over five explicit layouts: normalized relational rows, embedded owner documents, key-value records with optional manual owner references, owner/time wide-column partitions and graph adjacency. Compare candidate visits, range bounds and edge work while checking identical result records.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Run the same owner/neighborhood/time-range query over five explicit layouts: normalized relational rows, embedded owner documents, key-value records with optional manual owner references, owner/time wide-column partitions and graph adjacency. Compare candidate visits, range bounds and edge work while checking identical result records.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'SQL is a query language and relational is a data model; NoSQL covers several different models. Neither category alone decides ACID, schema validation, joins or consistency. Real SQL systems can store JSON and traverse graphs; many NoSQL products support transactions and secondary indexes.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'SQL is a query language and relational is a data model; NoSQL covers several different models. Neither category alone decides ACID, schema validation, joins or consistency. Real SQL systems can store JSON and traverse graphs; many NoSQL products support transactions and secondary indexes.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Turn off the row/KV owner index and compare a scan. Use a narrow time range to test clustering locality, then expand a directed friendship neighborhood. Explain which index or materialized references your implementation must maintain.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
