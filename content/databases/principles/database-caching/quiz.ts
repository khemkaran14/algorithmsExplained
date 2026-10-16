const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Cache-aside reads the cache and fills misses from the durable store. Write-through abstracts an ordered update of both stores; write-back makes the cache dirty and flushes later. TTL, invalidation loss, LRU eviction and cache crashes expose the difference between a copy and durable truth.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Cache-aside reads the cache and fills misses from the durable store. Write-through abstracts an ordered update of both stores; write-back makes the cache dirty and flushes later. TTL, invalidation loss, LRU eviction and cache crashes expose the difference between a copy and durable truth.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'The write-through model serializes two-store effects for teaching; a real cache and database do not share a magic atomic commit. Keys must include the query parameters and authorization scope. Stampedes, negative caching, transaction boundaries and invalidation ordering need explicit production policies.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'The write-through model serializes two-store effects for teaching; a real cache and database do not share a magic atomic commit. Keys must include the query parameters and authorization scope. Stampedes, negative caching, transaction boundaries and invalidation ordering need explicit production policies.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Lose invalidation, read a stale value and wait for TTL. Compare write-back crash loss with write-through. Fill the cache until a dirty eviction requires a flush.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
