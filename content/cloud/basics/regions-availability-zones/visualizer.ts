import { resilience } from '../../../../src/server/simulations/cloud/resilience';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(
  resilience('regions-availability-zones'),
  'regions-availability-zones',
  {
    aws: 'AWS Regions / Availability Zones',
    gcp: 'Google Cloud regions / zones',
    notes:
      'The exercise does not claim a cloud SLA or emulate a provider control plane. Correlated power, network and account failures need a broader threat model.',
  },
);
