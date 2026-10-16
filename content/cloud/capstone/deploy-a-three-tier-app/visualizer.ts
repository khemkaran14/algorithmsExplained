import { threeTier } from '../../../../src/server/simulations/cloud/three-tier';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
import { withCaseStudy } from '../../../../src/server/simulations/cases/overview';
export default withCaseStudy(
  withProvider(threeTier, 'deploy-a-three-tier-app', {
    aws: 'ALB \u2192 private EC2/ECS \u2192 RDS with ElastiCache concepts',
    gcp: 'Cloud Load Balancing \u2192 private app \u2192 Cloud SQL with Memorystore concepts',
    notes:
      'This local capstone provisions nothing and does not deploy AlgoVerse. Production needs provider-specific IaC, TLS, secret rotation, schema migrations, backups, observability, restore drills and rollback. Cacheable data here is public catalog data only.',
  }),
  {
    requirements: [
      'Serve public catalog reads through HTTPS ingress.',
      'Keep application-to-database traffic private and authorize workload identity.',
      'Bound queues and account for every offered request.',
      'Operate with explicit backup, alert and rollback ownership.',
    ],
    assumptions: {
      dailyActors: 100000,
      requestsPerActor: 20,
      peakMultiplier: 5,
      payloadBytes: 20000,
      retentionDays: 30,
    },
    apis: [
      {
        method: 'GET',
        path: '/catalog/items',
        purpose: 'Public catalog list; safe shared cache key',
      },
      {
        method: 'GET',
        path: '/catalog/items/:id',
        purpose: 'Public catalog detail or durable read',
      },
    ],
    entities: [
      {
        name: 'CatalogItem',
        fields: 'id, title, publicDescription, updatedAt',
      },
      { name: 'CacheEntry', fields: 'public cache key, value, expiry' },
    ],
    decisions: [
      'Introduce a public HTTPS entry point and keep backend instances private.',
      'Allow load-balancer-to-app traffic on the app port; scope workload identity separately.',
      'Use the cache only for public catalog data with an explicit key and TTL policy.',
      'Keep the database private, manage its credentials and budget its shared capacity.',
    ],
    breakInstructions:
      'Block DB identity and use zero cache hits, then compare 100% hits. Fail one app replica and account for completed, failed, rejected and pending requests. Restore private identity/path and inspect the shared DB bottleneck.',
  },
);
