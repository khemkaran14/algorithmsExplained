import { bubbleSort } from './bubble-sort';
import { binarySearch } from './binary-search';
import { stack } from './stack';
import { bfs } from './bfs';
import { bigO } from './big-o';
import type { Visualizer } from './types';
// Only the freely licensed flagship engine implementations live in this client registry.
// Paid modules must be loaded by the entitlement-checked server content loader.
export const freeVisualizers: Record<string, Visualizer> = {
  'bubble-sort': bubbleSort,
  'binary-search': binarySearch,
  stack,
  bfs,
  'big-o': bigO,
};
