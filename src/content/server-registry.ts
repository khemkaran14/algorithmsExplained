import { ApiError } from '@/lib/http';
import 'server-only';
import type { LessonMeta } from './catalog';
import type { Visualizer, Frame, ComplexityInfo } from '@/engine/types';
export type RemoteLessonData = {
  frames: Frame[];
  complexity: ComplexityInfo;
  presets: { best: number[]; average: number[]; worst: number[] };
  measurements: { n: number; count: number }[];
};
const loaders: Record<string, () => Promise<{ default: Visualizer }>> = {
  'merge-sort': () => import('../../content/dsa/sorting/merge-sort/visualizer'),
  'big-o': () => import('../../content/dsa/foundations/big-o/visualizer'),
  'bubble-sort': () =>
    import('../../content/dsa/sorting/bubble-sort/visualizer'),
  'binary-search': () =>
    import('../../content/dsa/searching/binary-search/visualizer'),
  stack: () => import('../../content/dsa/linear/stack/visualizer'),
  bfs: () => import('../../content/dsa/graphs/bfs/visualizer'),
};
export async function serverLessonData(
  meta: LessonMeta,
  raw?: unknown,
): Promise<RemoteLessonData> {
  const loader = loaders[meta.slug];
  if (!loader) throw new Error('Visualizer is not registered');
  const v = (await loader()).default;
  let input: number[];
  try {
    input = v.validateInput(raw ?? v.presets.average);
  } catch (error) {
    throw new ApiError(
      400,
      error instanceof Error ? error.message : 'Input is invalid.',
    );
  }
  const frames: Frame[] = [];
  for (const f of v.generate(input)) {
    if (frames.length >= 10000)
      throw new ApiError(400, 'Too many frames. Reduce the input size.');
    frames.push(f);
  }
  const measurements = [8, 16, 32, 64].map((n) => {
    const values = v.presets.random(
      meta.slug === 'bfs' ? Math.min(n, 16) : n,
      42,
    );
    let count = 0;
    for (const f of v.generate(values))
      count = f.counters.reads + f.counters.comparisons;
    return { n: values.length, count };
  });
  return {
    frames,
    complexity: v.complexity,
    presets: {
      best: v.presets.best,
      average: v.presets.average,
      worst: v.presets.worst,
    },
    measurements,
  };
}
