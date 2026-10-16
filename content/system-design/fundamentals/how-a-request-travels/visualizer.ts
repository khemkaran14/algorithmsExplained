import { trafficVisualizer } from '../../../../src/server/simulations/traffic';
export default trafficVisualizer({
  slug: 'how-a-request-travels',
  title: 'how a request travels',
  databaseCapacity: 12,
  why: 'Follow client ingress, load balancing, app processing, cache lookup and database completion. This throughput model abstracts DNS/TLS and transport details rather than pretending to simulate their packets.',
});
