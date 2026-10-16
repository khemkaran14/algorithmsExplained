const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'A memtable retains the latest write per key and flushes an immutable sorted run at its key-count bound. Reads check memory and then runs newest first. Tombstones stop older values from resurfacing. A two-hash Bloom filter can skip definitely absent keys but may admit false-positive probes. Partial oldest-run compaction preserves tombstones; full coverage of all runs can safely purge them.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'A memtable retains the latest write per key and flushes an immutable sorted run at its key-count bound. Reads check memory and then runs newest first. Tombstones stop older values from resurfacing. A two-hash Bloom filter can skip definitely absent keys but may admit false-positive probes. Partial oldest-run compaction preserves tombstones; full coverage of all runs can safely purge them.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'The model is not a complete leveled or tiered storage engine. Its simple compaction sorts merged entries; production uses sorted merge iterators and carefully chosen levels. Memtable durability requires WAL. Tombstone purging must prove that no older value remains outside the covered data.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'The model is not a complete leveled or tiered storage engine. Its simple compaction sorts merged entries; production uses sorted merge iterators and carefully chosen levels. Memtable durability requires WAL. Tombstone purging must prove that no older value remains outside the covered data.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Overwrite and delete a key across several runs, then read before and after partial/full compaction. Compare Bloom enabled and disabled on misses while keeping query answers identical. Inspect entries rewritten during flush and compaction.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
