import { resilience } from '../../../../src/server/simulations/cloud/resilience';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(
  resilience('disaster-recovery-strategies'),
  'disaster-recovery-strategies',
  {
    aws: 'AWS cross-region replication / backup concepts',
    gcp: 'Google Cloud cross-region replication / backup concepts',
    notes:
      'RPO is lost records and RTO model ticks, not a provider time guarantee. Copies still in flight at primary failure do not become magically complete. Recovery needs tested procedures and real backup retention.',
  },
);
