import { blockStorage } from '../../../../src/server/simulations/cloud/block-storage';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(blockStorage, 'ebs-persistent-disk', {
  aws: 'EBS volume concepts',
  gcp: 'Compute Engine Persistent Disk concepts',
  notes:
    'No real block device is accessed. Multi-attach capabilities, filesystem coordination, IOPS, disk types and cross-zone recovery differ by product; this model defaults to a single writer.',
});
