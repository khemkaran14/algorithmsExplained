const quiz = [
  {
    id: 'mechanism',
    question: 'Which behavior is modeled?',
    choices: [
      'Adjust app replicas and per-replica CPU work capacity. Requests enter the app pool, then the separately limited database; queues, rejected requests and completions are all accounted for. The AWS/GCP toggle changes component mappings, not a universal hardware performance claim.',
      'Service labels automatically provision secure resources.',
      'Every timeout proves an operation failed.',
    ],
    answer: 0,
    explanation:
      'Adjust app replicas and per-replica CPU work capacity. Requests enter the app pool, then the separately limited database; queues, rejected requests and completions are all accounted for. The AWS/GCP toggle changes component mappings, not a universal hardware performance claim.',
  },
  {
    id: 'scope',
    question: 'Which provider limitation matters?',
    choices: [
      'All products expose identical guarantees.',
      'EC2 and Compute Engine expose different instance families, images, disks and billing choices. The model uses assumed work units, not measured vCPU throughput or current pricing. OS patching, image policy, IAM and network configuration remain part of VM operation.',
      'Illustrative capacities are published cloud benchmarks.',
    ],
    answer: 1,
    explanation:
      'EC2 and Compute Engine expose different instance families, images, disks and billing choices. The model uses assumed work units, not measured vCPU throughput or current pricing. OS patching, image policy, IAM and network configuration remain part of VM operation.',
  },
  {
    id: 'experiment',
    question: 'Which experiment tests a design assumption?',
    choices: [
      'Overload one replica, add CPU or replicas, then fail the database. Explain why application scaling stops helping once the shared dependency is the bottleneck.',
      'Count boxes without changing inputs.',
      'Put access keys in the browser bundle.',
    ],
    answer: 0,
    explanation:
      'Change an explicit workload/failure assumption and inspect the conserved state.',
  },
];
export default quiz;
