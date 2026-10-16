const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Shared locks are mutually compatible, while an exclusive request conflicts with other owners. Strict two-phase locking holds locks until commit or rollback. Queued requests wait behind earlier conflicting requests. A wait-for graph points from a blocked transaction to its blockers; a directed cycle identifies deadlock. The model aborts the lexicographically greatest cycle member, releases its locks and wakes eligible waiters.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Shared locks are mutually compatible, while an exclusive request conflicts with other owners. Strict two-phase locking holds locks until commit or rollback. Queued requests wait behind earlier conflicting requests. A wait-for graph points from a blocked transaction to its blockers; a directed cycle identifies deadlock. The model aborts the lexicographically greatest cycle member, releases its locks and wakes eligible waiters.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'A wait is not automatically a deadlock. Re-requesting an already-held compatible lock does not create a new conflict. The reference implements compatibility and victim detection; the player adds transaction lifecycle and fair wakeups. Production engines have more lock classes, wait policies and victim cost heuristics.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'A wait is not automatically a deadlock. Re-requesting an already-held compatible lock does not create a new conflict. The reference implements compatibility and victim detection; the player adds transaction lifecycle and fair wakeups. Production engines have more lock classes, wait policies and victim cost heuristics.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Acquire x for A and y for B, then request y for A and x for B. Disable detection to retain the wait cycle, then enable victim rollback. Also test two shared holders both upgrading to exclusive.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
