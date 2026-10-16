import { trafficVisualizer } from '../../../../src/server/simulations/traffic';
export default trafficVisualizer({
  slug: 'latency-vs-throughput',
  title: 'latency vs throughput',
  databaseCapacity: 12,
  why: 'Compare completed requests per modeled second against the queue-derived response latency. Raise offered load until the bottleneck queue grows, then observe admission rejection.',
});
