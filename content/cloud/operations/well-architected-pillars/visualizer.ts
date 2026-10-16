import { wellArchitected } from '../../../../src/server/simulations/cloud/well-architected';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(wellArchitected, 'well-architected-pillars', {
  aws: 'AWS Well-Architected review concepts',
  gcp: 'Google Cloud Well-Architected review concepts',
  notes:
    'This is not a provider assessment, certification, SLA or total-cost calculation. Framework pillars differ by provider, and actual evidence, threat models, sustainability measurements and business requirements need review.',
});
