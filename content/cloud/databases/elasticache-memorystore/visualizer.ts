import { withProvider } from '../../../../src/server/simulations/cloud/provider';
import { cacheModel } from '../../../../src/server/simulations/cache-resilience';
export default withProvider(
  cacheModel('elasticache-memorystore'),
  'elasticache-memorystore',
  {
    aws: 'ElastiCache concepts',
    gcp: 'Memorystore concepts',
    notes:
      'Selected Redis/Valkey/Memcached products and configurations differ in persistence, failover, replication and API features. The model does not promise shared atomic commits between a cache and database or any provider durability guarantee.',
    nodes: {
      aws: { cache: 'ElastiCache', db: 'Durable application database' },
      gcp: { cache: 'Memorystore', db: 'Durable application database' },
    },
  },
);
