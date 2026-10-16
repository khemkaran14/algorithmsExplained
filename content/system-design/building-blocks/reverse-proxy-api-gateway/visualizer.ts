import { rateLimiter } from '../../../../src/server/simulations/rate-queue';
import type { Visualizer } from '../../../../src/engine/types';
import { trafficVisualizer } from '../../../../src/server/simulations/traffic';
const visualizer = trafficVisualizer({
  slug: 'reverse-proxy-api-gateway',
  title: 'reverse proxy api gateway',
  databaseCapacity: 12,
  why: 'The traffic variant shows the ingress boundary and downstream bottlenecks. The admission-policy variant compares four rate algorithms on timestamped client requests.',
  gateway: true,
});
visualizer.variantTitle = 'Traffic pipeline';
visualizer.variants = {
  admission: {
    title: 'Admission policies',
    visualizer: rateLimiter('reverse-proxy-api-gateway') as Visualizer<unknown>,
  },
};
export default visualizer;
