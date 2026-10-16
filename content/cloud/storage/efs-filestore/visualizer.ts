import { fileStorage } from '../../../../src/server/simulations/cloud/file-storage';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(fileStorage, 'efs-filestore', {
  aws: 'EFS shared filesystem concepts',
  gcp: 'Filestore shared filesystem concepts',
  notes:
    'The metadata CAS is an application abstraction, not a claim that NFS offers an atomic compare-and-append API. Real locks, leases, mounts and cache consistency require product-specific analysis.',
});
