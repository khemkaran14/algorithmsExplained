import { secrets } from '../../../../src/server/simulations/cloud/secrets';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(secrets, 'secrets-manager-secret-manager', {
  aws: 'Secrets Manager staged rotation concepts',
  gcp: 'Secret Manager versions / rotation events',
  notes:
    'No real secret value is stored. Provider staged rotation/version APIs differ; actual credentials require protected transport/storage, auditing and target-side revocation. A fetch permission change is not cache erasure.',
});
