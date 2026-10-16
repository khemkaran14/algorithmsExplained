import { loadVariantCode, type CodeLines } from './load';
import { visualizerLoaders } from './visualizer-index';
import { ApiError } from '@/lib/http';
import 'server-only';
import type { LessonMeta } from './catalog';
import type { Visualizer, Frame, ComplexityInfo } from '@/engine/types';
export type RemoteLessonData = {
  frames: Frame[];
  code?: CodeLines;
  variant?: string;
  variants?: { id: string; title: string }[];
  input: unknown;
  inputHint?: string;
  maxSize?: number;
  presetLabels?: Visualizer['presetLabels'];
  complexity: ComplexityInfo;
  presets: { best: unknown; average: unknown; worst: unknown };
  measurements: { n: number; count: number }[];
};
export async function serverLessonData(
  meta: LessonMeta,
  raw?: unknown,
  preset?: { kind: 'random'; size: number; seed: number },
  variant?: string,
): Promise<RemoteLessonData> {
  const loader = visualizerLoaders[meta.slug];
  if (!loader) throw new Error('Visualizer is not registered');
  const root = (await loader()).default;
  if (variant && variant !== 'default' && !root.variants?.[variant])
    throw new ApiError(400, 'This variant is not available.');
  const v =
    variant && variant !== 'default'
      ? root.variants![variant].visualizer
      : root;
  let input: unknown;
  try {
    input = v.validateInput(
      preset
        ? v.presets.random(preset.size, preset.seed)
        : (raw ?? v.presets.average),
    );
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
      count = (v.complexity.metric?.keys ?? ['reads', 'comparisons']).reduce(
        (sum, key) => sum + (f.counters[key] ?? 0),
        0,
      );
    return { n: v.measureSize?.(values) ?? measuredSize(values, n), count };
  });
  return {
    variant: variant ?? 'default',
    variants: root.variants
      ? [
          { id: 'default', title: root.variantTitle ?? 'Default' },
          ...Object.entries(root.variants).map(([id, value]) => ({
            id,
            title: value.title,
          })),
        ]
      : undefined,
    code:
      variant && variant !== 'default'
        ? await loadVariantCode(meta, variant)
        : undefined,
    frames,
    input,
    inputHint: v.inputHint,
    maxSize: v.maxSize,
    presetLabels: v.presetLabels,
    complexity: v.complexity,
    presets: {
      best: v.presets.best,
      average: v.presets.average,
      worst: v.presets.worst,
    },
    measurements: [
      ...new Map(measurements.map((point) => [point.n, point])).values(),
    ].sort((a, b) => a.n - b.n),
  };
}

function measuredSize(value: unknown, fallback: number): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'string') return Array.from(value).length;
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of [
      'values',
      'weights',
      'nodes',
      'points',
      'accesses',
      'parents',
      'keys',
      'words',
      'insert',
    ])
      if (Array.isArray(record[key])) return record[key].length;
    for (const key of ['n', 'requests'])
      if (typeof record[key] === 'number') return record[key];
    if (typeof record.text === 'string') return Array.from(record.text).length;
    if (typeof record.bit === 'number') return 8;
  }
  return fallback;
}
