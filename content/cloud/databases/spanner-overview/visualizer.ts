import { spanner } from '../../../../src/server/simulations/cloud/spanner';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(spanner, 'spanner-overview', {
  aws: 'Aurora DSQL comparison (different implementation)',
  gcp: 'Spanner consistency / clock uncertainty concepts',
  notes:
    'This is not Paxos, TrueTime infrastructure, Spanner SQL transactions or an Aurora DSQL emulator. The AWS comparison does not imply the same clock or consensus implementation.',
});
