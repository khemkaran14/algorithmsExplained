import { topological } from '../../../../src/server/visualizers/graphs';
import type { Visualizer } from '../../../../src/engine/types';
const visualizer = topological(false);
visualizer.variantTitle = 'Kahn queue';
visualizer.variants = {
  dfs: {
    title: 'DFS finish order',
    visualizer: topological(true) as Visualizer<unknown>,
  },
};
export default visualizer;
