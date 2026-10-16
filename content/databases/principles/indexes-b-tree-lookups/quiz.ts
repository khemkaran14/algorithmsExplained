const quiz = [
  {
    id: 'mechanism',
    question: 'Which statement describes this lesson\u2019s mechanism?',
    choices: [
      'Insert integer keys into an order-four page tree. When a page overflows, split it and promote a separator; a root split adds a level. In B+ mode all data keys remain in linked leaves and internal keys are routing copies. Search chooses one child per internal page, routing separator equality to the right leaf. The model deduplicates integer keys; a real non-unique index additionally stores tuple identities.',
      'NULL always equals every missing primary key.',
      'Every diagram automatically enforces a transaction.',
    ],
    answer: 0,
    explanation:
      'Insert integer keys into an order-four page tree. When a page overflows, split it and promote a separator; a root split adds a level. In B+ mode all data keys remain in linked leaves and internal keys are routing copies. Search chooses one child per internal page, routing separator equality to the right leaf. The model deduplicates integer keys; a real non-unique index additionally stores tuple identities.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation must a correct explanation include?',
    choices: [
      'A tiny sample proves every functional dependency.',
      'The teaching order is four, not a production page size. Real indexes need concurrent latching, persistence, vacuum/MVCC visibility, duplicate handling and page maintenance. This is the actual split/search engine, not the separate illustrative cost planner.',
      'Physical execution order must equal SQL clause order.',
    ],
    answer: 1,
    explanation:
      'The teaching order is four, not a production page size. Real indexes need concurrent latching, persistence, vacuum/MVCC visibility, duplicate handling and page maintenance. This is the actual split/search engine, not the separate illustrative cost planner.',
  },
  {
    id: 'experiment',
    question: 'Which experiment investigates the actual model?',
    choices: [
      'Search for an existing separator and a missing key, then insert increasing keys to trigger root and leaf splits. Switch B+ mode off to compare data placement in a B tree.',
      'Count interface panels only.',
      'Assume a cache enforces every foreign key.',
    ],
    answer: 0,
    explanation:
      'Change one input assumption and inspect the resulting rows, keys or dependencies.',
  },
];
export default quiz;
