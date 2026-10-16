import 'server-only';
import { withCaseStudy } from './overview';
import { distributedCache } from './distributed-cache';
export default withCaseStudy(distributedCache, {
  requirements: [
    'Place keys on distinct physical cache replicas.',
    'Use bounded LRU capacity and explicit TTL expiration.',
    'Expose stale recovery and origin-unavailable misses.',
  ],
  apis: [
    {
      method: 'GET',
      path: '/cache/{key}',
      purpose: 'Read a replica hit or fill from the origin.',
    },
    {
      method: 'PUT',
      path: '/records/{key}',
      purpose: 'Persist a new version and update healthy cache owners.',
    },
  ],
  entities: [
    { name: 'OriginRecord', fields: 'key PK, value, version' },
    {
      name: 'CacheEntry',
      fields: 'nodeId + key, value, version, expiresAt, LRUPosition',
    },
  ],
  decisions: [
    'The origin owns durable versions while cache entries may expire or be evicted.',
    'Virtual tokens determine owners but are not physical replication.',
    'Read healthy owners in ring order, then fill from the origin on a miss.',
    'Write-through updates healthy owners and may leave a disconnected owner stale.',
    'A recovered stale replica requires invalidation, version validation or bounded TTL.',
  ],
  breakInstructions:
    'Warm a key, fail its primary, write a new value, then restore the primary before TTL. Inspect the freshness audit; disable the origin to distinguish replica hits from failed misses.',
  assumptions: {
    dailyActors: 100000,
    requestsPerActor: 20,
    peakMultiplier: 5,
    payloadBytes: 1000,
    retentionDays: 30,
  },
});
