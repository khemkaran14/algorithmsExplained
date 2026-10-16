import { trafficVisualizer } from '../../../../src/server/simulations/traffic';
const visualizer = trafficVisualizer({
  slug: 'load-balancers',
  title: 'load balancers',
  databaseCapacity: 12,
  why: 'Watch round-robin app processing, per-replica work counts and the separate database budget. Losing one app instance reduces available app capacity; extra instances do not make a failed database healthy.',
});
export default visualizer;
