const quiz = [
  {
    id: 'mechanism',
    question: 'Which behavior is modeled?',
    choices: [
      'Explore cache-aside, ordered write-through and dirty write-back using TTL, eviction, invalidation loss and cache crashes. The model makes stale reads and unflushed data loss visible.',
      'Service labels automatically provision secure resources.',
      'Every timeout proves an operation failed.',
    ],
    answer: 0,
    explanation:
      'Explore cache-aside, ordered write-through and dirty write-back using TTL, eviction, invalidation loss and cache crashes. The model makes stale reads and unflushed data loss visible.',
  },
  {
    id: 'scope',
    question: 'Which provider limitation matters?',
    choices: [
      'All products expose identical guarantees.',
      'Selected Redis/Valkey/Memcached products and configurations differ in persistence, failover, replication and API features. The model does not promise shared atomic commits between a cache and database or any provider durability guarantee.',
      'Illustrative capacities are published cloud benchmarks.',
    ],
    answer: 1,
    explanation:
      'Selected Redis/Valkey/Memcached products and configurations differ in persistence, failover, replication and API features. The model does not promise shared atomic commits between a cache and database or any provider durability guarantee.',
  },
  {
    id: 'experiment',
    question: 'Which experiment tests a design assumption?',
    choices: [
      'Lose invalidation, wait for expiry and compare write-back cache loss with a durable store update. Inspect dirty eviction flushes.',
      'Count boxes without changing inputs.',
      'Put access keys in the browser bundle.',
    ],
    answer: 0,
    explanation:
      'Change an explicit workload/failure assumption and inspect the conserved state.',
  },
];
export default quiz;
