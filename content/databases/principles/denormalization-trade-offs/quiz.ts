const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'The normalized read follows Order.customerId to the authoritative current customer address. The denormalized read uses a duplicate address stored in each order. An update then requires fan-out writes. Compare synchronous atomic fan-out, unsafe split writes, and a durable asynchronous propagation queue. A failed split update can leave mixed versions; an atomic failure rolls back the profile and every copy.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'The normalized read follows Order.customerId to the authoritative current customer address. The denormalized read uses a duplicate address stored in each order. An update then requires fan-out writes. Compare synchronous atomic fan-out, unsafe split writes, and a durable asynchronous propagation queue. A failed split update can leave mixed versions; an atomic failure rolls back the profile and every copy.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'This address is explicitly current-profile cache data. A historical shipping-address snapshot is an immutable order fact and must not be rewritten when a customer moves. Atomic preflight is a deterministic teaching assumption; production fan-out needs real transactions or an outbox with ordering and reconciliation.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'This address is explicitly current-profile cache data. A historical shipping-address snapshot is an immutable order fact and must not be rewritten when a customer moves. Atomic preflight is a deterministic teaching assumption; production fan-out needs real transactions or an outbox with ordering and reconciliation.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Fail after one copied row, read two orders, and repair the stale copies. Compare normalized reads and asynchronous propagation with workers unavailable. Repair drains obsolete tasks before rebuilding current copies.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
