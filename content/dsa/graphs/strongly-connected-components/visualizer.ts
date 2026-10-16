import { strongComponents } from '../../../../src/server/visualizers/graphs';
import type { Visualizer } from '../../../../src/engine/types';
const visualizer = strongComponents(false);
visualizer.variantTitle = 'Kosaraju transpose';
visualizer.variants = {
  tarjan: {
    title: 'Tarjan low links',
    visualizer: strongComponents(true) as Visualizer<unknown>,
  },
};
export default visualizer;
