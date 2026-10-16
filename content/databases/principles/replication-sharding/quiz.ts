const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'The replicated-register model keeps two versioned copies and compares strong, eventual and session policies under partitions and delayed propagation. Switch to shard ownership to compare modulo, ranges and consistent hashing when adding a physical owner. Replication and partitioning solve different problems and can be combined.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'The replicated-register model keeps two versioned copies and compares strong, eventual and session policies under partitions and delayed propagation. Switch to shard ownership to compare modulo, ranges and consistent hashing when adding a physical owner. Replication and partitioning solve different problems and can be combined.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'The register is a version-and-propagation model, not a production consensus protocol. Consistent-hash virtual tokens improve distribution but are not physical replicas. Migration, rebalancing traffic, transactions across shards and failover protocols are separate concerns.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'The register is a version-and-propagation model, not a production consensus protocol. Consistent-hash virtual tokens improve distribution but are not physical replicas. Migration, rebalancing traffic, transactions across shards and failover protocols are separate concerns.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Partition the replicas and compare acknowledged writes and reads. Switch to shard ownership, add one owner and inspect key movement and load. Do not infer durability from a placement diagram.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
