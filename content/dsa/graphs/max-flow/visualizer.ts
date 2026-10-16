import { maxFlow } from '../../../../src/server/visualizers/graphs';
import type { Visualizer } from '../../../../src/engine/types';
const visualizer = maxFlow(false);
visualizer.variantTitle = 'Edmonds–Karp BFS';
visualizer.variants = {
  'ford-fulkerson': {
    title: 'Ford–Fulkerson DFS',
    visualizer: maxFlow(true) as Visualizer<unknown>,
  },
};
export default visualizer;
