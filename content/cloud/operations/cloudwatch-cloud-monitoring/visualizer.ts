import { observability } from '../../../../src/server/simulations/cloud/observability';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(observability, 'cloudwatch-cloud-monitoring', {
  aws: 'CloudWatch metric / alarm concepts',
  gcp: 'Cloud Monitoring SLO / alert concepts',
  notes:
    'No metrics leave the browser/server model. A request-based SLO is not an availability SLA; real alerts need multi-window design, ownership, retention and validated telemetry quality.',
});
