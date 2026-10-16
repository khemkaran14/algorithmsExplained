import { dns } from '../../../../src/server/simulations/cloud/dns';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(dns, 'route-53-cloud-dns', {
  aws: 'Route 53 routing concepts',
  gcp: 'Cloud DNS authoritative-record concepts',
  notes:
    'Recursive caching, DNSSEC, failover/routing features and error-response caching are richer than this exercise. Route 53 health-routing and Google Cloud DNS integrations are not identical products.',
});
