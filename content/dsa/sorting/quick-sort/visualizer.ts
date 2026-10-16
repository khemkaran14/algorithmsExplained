import {
  sortingVisualizer,
  quickHoare,
} from '../../../../src/server/visualizers/sorting';
import type { Visualizer } from '../../../../src/engine/types';
const visualizer = sortingVisualizer('quick-sort');
visualizer.variantTitle = 'Lomuto partition';
visualizer.variants = {
  hoare: {
    title: 'Hoare partition',
    visualizer: quickHoare as Visualizer<unknown>,
  },
};
export default visualizer;
