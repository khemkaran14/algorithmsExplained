import { cost } from '../../../../src/server/simulations/cloud/cost';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(cost, 'cloud-cost-optimization', {
  aws: 'AWS workload cost assumptions',
  gcp: 'Google Cloud workload cost assumptions',
  notes:
    'These are assumed USD inputs, not current provider pricing, quotes or a complete bill. Duration, tiers, commitments, taxes, minimum charges and regional transfers are excluded; verify provider calculators and actual invoices.',
});
