import { trafficVisualizer } from '../../../../src/server/simulations/traffic';
export default trafficVisualizer({
  slug: 'cloudfront-cloud-cdn',
  title: 'CloudFront / Cloud CDN',
  databaseCapacity: 12,
  why: 'The edge-cache path is checked before the modeled origin region. Cache hits complete at the edge; misses still need healthy app/database work. A seeded hit probability is an illustrative traffic assumption, not an implementation of HTTP cache-control or provider invalidation.',
  edgeCache: true,
});
