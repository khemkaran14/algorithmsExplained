import { trafficVisualizer } from '../../../../src/server/simulations/traffic';
export default trafficVisualizer({
  slug: 'vertical-vs-horizontal-scaling',
  title: 'vertical vs horizontal scaling',
  databaseCapacity: 12,
  why: 'Compare CPU units per replica with the number of app replicas. Each changes the app service budget; database capacity, cache behavior and shared failures remain separate constraints.',
});
