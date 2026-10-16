const quiz = [
  {
    id: 'mechanism',
    question: 'Which behavior is modeled?',
    choices: [
      'Compare explicit key-value, embedded-document and owner/time partition layouts over the same records. Observe owner lookups, clustering-range bounds and manually maintained references. A layout name alone does not grant a native query API.',
      'Service labels automatically provision secure resources.',
      'Every timeout proves an operation failed.',
    ],
    answer: 0,
    explanation:
      'Compare explicit key-value, embedded-document and owner/time partition layouts over the same records. Observe owner lookups, clustering-range bounds and manually maintained references. A layout name alone does not grant a native query API.',
  },
  {
    id: 'scope',
    question: 'Which provider limitation matters?',
    choices: [
      'All products expose identical guarantees.',
      'DynamoDB items, Firestore documents and Bigtable rows have different query, index, transaction and limit semantics. Relational/graph modes are comparison baselines, not a claim that these services expose native SQL or graph traversal.',
      'Illustrative capacities are published cloud benchmarks.',
    ],
    answer: 1,
    explanation:
      'DynamoDB items, Firestore documents and Bigtable rows have different query, index, transaction and limit semantics. Relational/graph modes are comparison baselines, not a claim that these services expose native SQL or graph traversal.',
  },
  {
    id: 'experiment',
    question: 'Which experiment tests a design assumption?',
    choices: [
      'Narrow a time range and compare candidate visits; remove the owner index and explain the required scan or application-maintained reference.',
      'Count boxes without changing inputs.',
      'Put access keys in the browser bundle.',
    ],
    answer: 0,
    explanation:
      'Change an explicit workload/failure assumption and inspect the conserved state.',
  },
];
export default quiz;
