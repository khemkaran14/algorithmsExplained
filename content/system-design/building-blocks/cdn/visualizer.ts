import { trafficVisualizer } from '../../../../src/server/simulations/traffic';
const visualizer = trafficVisualizer({
  slug: 'cdn',
  title: 'cdn',
  databaseCapacity: 12,
  why: 'The edge-cache model serves hits before origin app/database work. A simulated origin-region outage still permits existing global edge hits; misses reject when the origin is unavailable.',
  edgeCache: true,
});
export default visualizer;
