const quiz = [
  {
    id: 'mechanism',
    question: 'Which behavior is modeled?',
    choices: [
      'Use an order saga as a worked workflow: reserve inventory, authorize a hold, reserve a courier, capture, fulfill. Compensate known failures in reverse order; retain resources after an uncertain capture until an explicit reconciliation result.',
      'Service labels automatically provision secure resources.',
      'Every timeout proves an operation failed.',
    ],
    answer: 0,
    explanation:
      'Use an order saga as a worked workflow: reserve inventory, authorize a hold, reserve a courier, capture, fulfill. Compensate known failures in reverse order; retain resources after an uncertain capture until an explicit reconciliation result.',
  },
  {
    id: 'scope',
    question: 'Which provider limitation matters?',
    choices: [
      'All products expose identical guarantees.',
      'The trace is a business-workflow model, not an ASL or Google Workflows deployment. Production needs durable orchestration state, provider-specific retries/catches, scoped IAM, task idempotency and reconciliation. Compensation may itself fail and require further recovery.',
      'Illustrative capacities are published cloud benchmarks.',
    ],
    answer: 1,
    explanation:
      'The trace is a business-workflow model, not an ASL or Google Workflows deployment. Production needs durable orchestration state, provider-specific retries/catches, scoped IAM, task idempotency and reconciliation. Compensation may itself fail and require further recovery.',
  },
  {
    id: 'experiment',
    question: 'Which experiment tests a design assumption?',
    choices: [
      'Compare a failed capture with a timeout whose result is unknown. Resolve the uncertain outcome to captured or failed, then inspect resource conservation.',
      'Count boxes without changing inputs.',
      'Put access keys in the browser bundle.',
    ],
    answer: 0,
    explanation:
      'Change an explicit workload/failure assumption and inspect the conserved state.',
  },
];
export default quiz;
