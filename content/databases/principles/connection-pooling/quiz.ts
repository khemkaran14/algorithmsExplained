const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Each replica owns a bounded local pool, while every physical connection also counts toward the shared database limit. Requests reuse idle local connections or open new ones only when both caps permit. FIFO acquisition waiters have a separate timeout from query duration. Query completion releases a checked-out slot unless the application leaks it; idle sockets remain owned by their original replica.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Each replica owns a bounded local pool, while every physical connection also counts toward the shared database limit. Requests reuse idle local connections or open new ones only when both caps permit. FIFO acquisition waiters have a separate timeout from query duration. Query completion releases a checked-out slot unless the application leaks it; idle sockets remain owned by their original replica.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'This is a resource model with no real sockets. Connection pooling, transaction pooling and session-state semantics differ by provider. Adding replicas can multiply connection pressure; a bigger wait queue does not add database capacity. Always release real clients in finally blocks.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'This is a resource model with no real sockets. Connection pooling, transaction pooling and session-state semantics differ by provider. Adding replicas can multiply connection pressure; a bigger wait queue does not add database capacity. Always release real clients in finally blocks.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Leak all connections on one replica and submit work on another. Compare local pool size, shared database limit and replica count. Verify request conservation and distinguish completed-but-leaked queries from pending acquisition.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
