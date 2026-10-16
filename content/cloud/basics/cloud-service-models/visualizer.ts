import { withProvider } from '../../../../src/server/simulations/cloud/provider';
import { responsibility } from '../../../../src/server/simulations/cloud/responsibility';
export default withProvider(
  responsibility('cloud-service-models'),
  'cloud-service-models',
  {
    aws: 'EC2 IaaS / managed platform / SaaS concepts',
    gcp: 'Compute Engine IaaS / App Engine / Google SaaS concepts',
    notes:
      'This is a declared baseline, not every provider product contract. Google Workspace is a Google SaaS example, not a resource inside a GCP project. Actual contract, configuration and business requirements define each responsibility.',
  },
);
