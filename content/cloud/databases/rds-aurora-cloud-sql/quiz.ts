const quiz = [
  {
    id: 'mechanism',
    question: 'Which behavior is modeled?',
    choices: [
      'Use a two-register consistency model to distinguish waiting for both copies, local eventual progress and session monotonicity. Explore delayed delivery and a network partition before discussing a concrete managed database architecture.',
      'Service labels automatically provision secure resources.',
      'Every timeout proves an operation failed.',
    ],
    answer: 0,
    explanation:
      'Use a two-register consistency model to distinguish waiting for both copies, local eventual progress and session monotonicity. Explore delayed delivery and a network partition before discussing a concrete managed database architecture.',
  },
  {
    id: 'scope',
    question: 'Which provider limitation matters?',
    choices: [
      'All products expose identical guarantees.',
      'This generic register is not an RDS, Aurora or Cloud SQL failover implementation. AWS RDS Multi-AZ, Aurora storage/read endpoints and Google Cloud SQL HA/read replicas have distinct topologies and guarantees; consult the selected service design.',
      'Illustrative capacities are published cloud benchmarks.',
    ],
    answer: 1,
    explanation:
      'This generic register is not an RDS, Aurora or Cloud SQL failover implementation. AWS RDS Multi-AZ, Aurora storage/read endpoints and Google Cloud SQL HA/read replicas have distinct topologies and guarantees; consult the selected service design.',
  },
  {
    id: 'experiment',
    question: 'Which experiment tests a design assumption?',
    choices: [
      'Partition replicas, compare acknowledged writes and session reads, then heal and inspect convergence. Separate standby failover from read-replica use.',
      'Count boxes without changing inputs.',
      'Put access keys in the browser bundle.',
    ],
    answer: 0,
    explanation:
      'Change an explicit workload/failure assumption and inspect the conserved state.',
  },
];
export default quiz;
