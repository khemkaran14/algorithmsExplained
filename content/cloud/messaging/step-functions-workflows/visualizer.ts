import { withProvider } from '../../../../src/server/simulations/cloud/provider';
import { foodSaga } from '../../../../src/server/simulations/cases/food-saga';
export default withProvider(foodSaga, 'step-functions-workflows', {
  aws: 'Step Functions orchestration concepts',
  gcp: 'Workflows orchestration concepts',
  notes:
    'The trace is a business-workflow model, not an ASL or Google Workflows deployment. Production needs durable orchestration state, provider-specific retries/catches, scoped IAM, task idempotency and reconciliation. Compensation may itself fail and require further recovery.',
});
