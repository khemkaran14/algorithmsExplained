import { kms } from '../../../../src/server/simulations/cloud/kms';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(kms, 'kms-cloud-kms', {
  aws: 'KMS envelope encryption concepts',
  gcp: 'Cloud KMS key versions / envelope encryption',
  notes:
    'The visualizer uses PUBLIC deterministic teaching keys and nonces: never use it for secrets. Explicit version disable maps separate KEKs/GCP-style versions, not identical AWS automatic-rotation controls. No cloud KMS is contacted.',
});
