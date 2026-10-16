const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Customer and Order are entities. Each customer may own zero or many orders; each order references zero or one customer because the foreign key is nullable. Enforce distinct order IDs, customer identity and existing non-null references. A mandatory relationship would additionally need NOT NULL. Many-to-many relations need an association entity and a unique pair or its own key.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Customer and Order are entities. Each customer may own zero or many orders; each order references zero or one customer because the foreign key is nullable. Enforce distinct order IDs, customer identity and existing non-null references. A mandatory relationship would additionally need NOT NULL. Many-to-many relations need an association entity and a unique pair or its own key.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'Cardinality and optionality are separate choices. An ER diagram does not enforce a database constraint or prove that a business identifier is unique. The model implements one optional one-to-many relationship, not a general ER editor.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'Cardinality and optionality are separate choices. An ER diagram does not enforce a database constraint or prove that a business identifier is unique. The model implements one optional one-to-many relationship, not a general ER editor.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Try an order without a customer, an orphan customerId and duplicate entities. Explain which changes require a new relationship constraint.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
