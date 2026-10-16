import { withProvider } from '../../../../src/server/simulations/cloud/provider';
import { consistencyVisualizer } from '../../../../src/server/simulations/consistency';
export default withProvider(
  consistencyVisualizer('rds-aurora-cloud-sql'),
  'rds-aurora-cloud-sql',
  {
    aws: 'RDS / Aurora concepts',
    gcp: 'Cloud SQL concepts',
    notes:
      'This generic register is not an RDS, Aurora or Cloud SQL failover implementation. AWS RDS Multi-AZ, Aurora storage/read endpoints and Google Cloud SQL HA/read replicas have distinct topologies and guarantees; consult the selected service design.',
  },
);
