const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Updates append before-images and after-images to WAL and modify a volatile buffer page. Steal permits an uncommitted page to flush; write-ahead ordering first forces its log record. No-force permits commit without flushing data pages, but synchronous commit forces the commit record. A crash discards volatile data and the unforced log suffix. Recovery redoes durable updates using page LSNs, then undoes loser transactions in reverse order.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Updates append before-images and after-images to WAL and modify a volatile buffer page. Steal permits an uncommitted page to flush; write-ahead ordering first forces its log record. No-force permits commit without flushing data pages, but synchronous commit forces the commit record. A crash discards volatile data and the unforced log suffix. Recovery redoes durable updates using page LSNs, then undoes loser transactions in reverse order.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'This is a bounded single-recovery exercise, not full ARIES. Checkpoints, transaction analysis, compensation log records, WAL integrity and crashes during recovery are omitted. Conflicting open writes are blocked. Never promise safe undo when the required log before-image was lost.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'This is a bounded single-recovery exercise, not full ARIES. Checkpoints, transaction analysis, compensation log records, WAL integrity and crashes during recovery are omitted. Conflicting open writes are blocked. Never promise safe undo when the required log before-image was lost.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Commit one transaction without flushing its page, steal another transaction\u2019s dirty page, then crash. Compare redo and undo results. Disable WAL-before-page to expose an unlogged disk update; disable synchronous commit to show an acknowledged commit that can be lost.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
