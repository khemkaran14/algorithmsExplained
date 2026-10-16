const quiz = [
  {
    id: 'mechanism',
    question: 'Which behavior is modeled?',
    choices: [
      'Round-robin service work goes to healthy app replicas, with a separate database queue and budget. Fail one app target or the database and inspect the completed, pending and rejected counts.',
      'Service labels automatically provision secure resources.',
      'Every timeout proves an operation failed.',
    ],
    answer: 0,
    explanation:
      'Round-robin service work goes to healthy app replicas, with a separate database queue and budget. Fail one app target or the database and inspect the completed, pending and rejected counts.',
  },
  {
    id: 'scope',
    question: 'Which provider limitation matters?',
    choices: [
      'All products expose identical guarantees.',
      'These are conceptual mappings. AWS ALB and Google Cloud Load Balancing have product-specific scopes, health checks, backends, session behavior and layer-7 features; this trace is not their control-plane implementation.',
      'Illustrative capacities are published cloud benchmarks.',
    ],
    answer: 1,
    explanation:
      'These are conceptual mappings. AWS ALB and Google Cloud Load Balancing have product-specific scopes, health checks, backends, session behavior and layer-7 features; this trace is not their control-plane implementation.',
  },
  {
    id: 'experiment',
    question: 'Which experiment tests a design assumption?',
    choices: [
      'Hold CPU constant, change replica count and introduce an app-target failure. Compare it with a downstream database failure and explain where health checks belong.',
      'Count boxes without changing inputs.',
      'Put access keys in the browser bundle.',
    ],
    answer: 0,
    explanation:
      'Change an explicit workload/failure assumption and inspect the conserved state.',
  },
];
export default quiz;
