const quiz = [
  {
    id: 'mechanism',
    question: 'Which behavior is modeled?',
    choices: [
      'Compare IaaS, PaaS and SaaS against explicit task ownership. IaaS exposes guest OS/runtime/app maintenance, PaaS manages the runtime, and SaaS manages application source. Customer tenant-data policy and account credentials remain customer choices.',
      'Service labels automatically provision secure resources.',
      'Every timeout proves an operation failed.',
    ],
    answer: 0,
    explanation:
      'Compare IaaS, PaaS and SaaS against explicit task ownership. IaaS exposes guest OS/runtime/app maintenance, PaaS manages the runtime, and SaaS manages application source. Customer tenant-data policy and account credentials remain customer choices.',
  },
  {
    id: 'scope',
    question: 'Which provider limitation matters?',
    choices: [
      'All products expose identical guarantees.',
      'This is a declared baseline, not every provider product contract. Google Workspace is a Google SaaS example, not a resource inside a GCP project. Actual contract, configuration and business requirements define each responsibility.',
      'Illustrative capacities are published cloud benchmarks.',
    ],
    answer: 1,
    explanation:
      'This is a declared baseline, not every provider product contract. Google Workspace is a Google SaaS example, not a resource inside a GCP project. Actual contract, configuration and business requirements define each responsibility.',
  },
  {
    id: 'experiment',
    question: 'Which experiment tests a design assumption?',
    choices: [
      'Change the service boundary and inspect which incomplete patch flags remain customer gaps. Then make a tenant data-access decision unsafe and explain why SaaS does not fix it.',
      'Count boxes without changing inputs.',
      'Put access keys in the browser bundle.',
    ],
    answer: 0,
    explanation:
      'Change an explicit workload/failure assumption and inspect the conserved state.',
  },
];
export default quiz;
