const quiz = [
  {
    id: 'mechanism',
    question: 'Which behavior is modeled?',
    choices: [
      'The edge-cache path is checked before the modeled origin region. Cache hits complete at the edge; misses still need healthy app/database work. A seeded hit probability is an illustrative traffic assumption, not an implementation of HTTP cache-control or provider invalidation.',
      'Service labels automatically provision secure resources.',
      'Every timeout proves an operation failed.',
    ],
    answer: 0,
    explanation:
      'The edge-cache path is checked before the modeled origin region. Cache hits complete at the edge; misses still need healthy app/database work. A seeded hit probability is an illustrative traffic assumption, not an implementation of HTTP cache-control or provider invalidation.',
  },
  {
    id: 'scope',
    question: 'Which provider limitation matters?',
    choices: [
      'All products expose identical guarantees.',
      'CloudFront and Cloud CDN differ in origin configuration and invalidation APIs. Cache keys, authorization variation, TTL, stale policy and private content require explicit security design. Never cache personalized app responses under a shared key.',
      'Illustrative capacities are published cloud benchmarks.',
    ],
    answer: 1,
    explanation:
      'CloudFront and Cloud CDN differ in origin configuration and invalidation APIs. Cache keys, authorization variation, TTL, stale policy and private content require explicit security design. Never cache personalized app responses under a shared key.',
  },
  {
    id: 'experiment',
    question: 'Which experiment tests a design assumption?',
    choices: [
      'Raise the hit target and fail the origin region. Account for edge hits versus rejected misses, then lower the hit target and compare origin load.',
      'Count boxes without changing inputs.',
      'Put access keys in the browser bundle.',
    ],
    answer: 0,
    explanation:
      'Change an explicit workload/failure assumption and inspect the conserved state.',
  },
];
export default quiz;
