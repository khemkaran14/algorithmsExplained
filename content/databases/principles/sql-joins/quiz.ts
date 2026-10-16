const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Nested loops test Customer.id = Order.customerId. Equality with NULL never matches. INNER emits matching pairs; LEFT additionally retains unmatched customers; RIGHT retains unmatched orders; FULL retains both sides. Null-extended columns belong to the missing side. A matched key with two orders emits two rows.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Nested loops test Customer.id = Order.customerId. Equality with NULL never matches. INNER emits matching pairs; LEFT additionally retains unmatched customers; RIGHT retains unmatched orders; FULL retains both sides. Null-extended columns belong to the missing side. A matched key with two orders emits two rows.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'A condition in ON changes matching; a condition in WHERE filters the joined output. COUNT(*) counts null-extended rows while COUNT(rightColumn) ignores its NULLs. The reference uses nested loops, not an optimizer-selected physical plan.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'A condition in ON changes matching; a condition in WHERE filters the joined output. COUNT(*) counts null-extended rows while COUNT(rightColumn) ignores its NULLs. The reference uses nested loops, not an optimizer-selected physical plan.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Switch between all four joins on the same dataset. With constraints disabled, duplicate both sides and count the multiplication of matched pairs. Compare NULL foreign keys with an orphan value.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
