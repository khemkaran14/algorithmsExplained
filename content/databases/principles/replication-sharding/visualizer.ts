import { consistencyVisualizer } from '../../../../src/server/simulations/consistency';
import { sharding } from '../../../../src/server/simulations/ids-sharding';
import type { Visualizer } from '../../../../src/engine/types';
const visualizer = consistencyVisualizer('replication-sharding');
visualizer.variantTitle = 'Replicated register';
visualizer.variants = {
  sharding: {
    title: 'Shard ownership',
    visualizer: sharding('replication-sharding') as Visualizer<unknown>,
  },
};
export default visualizer;
