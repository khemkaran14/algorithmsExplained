import 'server-only';
import { z } from 'zod';
import type { VisualState } from '@/engine/types';
const edge = z
  .union([
    z.tuple([z.number().int(), z.number().int()]),
    z.tuple([
      z.number().int(),
      z.number().int(),
      z.number().int().min(-999).max(999),
    ]),
  ])
  .transform(([u, v, w]) => [u, v, w ?? 1] as [number, number, number]);
export const graphSchema = z.object({
  n: z.number().int().min(1).max(64),
  edges: z.array(edge).max(256),
  directed: z.boolean().default(false),
  start: z.number().int().min(0).max(63).default(0),
  target: z.number().int().min(0).max(63).optional(),
});
export type GraphInput = z.infer<typeof graphSchema>;
export function parseGraph(
  raw: unknown,
  options: { nonnegative?: boolean; directed?: boolean } = {},
): GraphInput {
  let input = raw;
  if (typeof raw === 'string') {
    try {
      input = JSON.parse(raw);
    } catch {
      throw new Error('Enter a valid graph JSON object.');
    }
  }
  if (
    options.directed &&
    input &&
    typeof input === 'object' &&
    !Array.isArray(input) &&
    !('directed' in input)
  )
    input = { ...input, directed: true };
  const parsed = graphSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(
      'Use n=1–64, up to 256 [from,to,weight] edges, and valid start/target indices.',
    );
  const g = parsed.data;
  if (
    g.start >= g.n ||
    (g.target !== undefined && g.target >= g.n) ||
    g.edges.some(([u, v]) => u < 0 || v < 0 || u >= g.n || v >= g.n)
  )
    throw new Error('Every vertex index must lie between zero and n−1.');
  if (options.nonnegative && g.edges.some((e) => e[2] < 0))
    throw new Error('This algorithm requires nonnegative edge weights.');
  const seen = new Set<string>();
  for (const [u, v] of g.edges) {
    const key = g.directed
      ? `${u},${v}`
      : `${Math.min(u, v)},${Math.max(u, v)}`;
    if (seen.has(key))
      throw new Error(
        'Parallel copies of the same edge are not supported in this model.',
      );
    seen.add(key);
  }
  return g;
}
export function adjacency(g: GraphInput) {
  const a = Array.from(
    { length: g.n },
    () => [] as { to: number; weight: number; edge: number }[],
  );
  g.edges.forEach(([u, v, weight], edge) => {
    a[u].push({ to: v, weight, edge });
    if (!g.directed && u !== v) a[v].push({ to: u, weight, edge });
  });
  return a;
}
export function graphState(g: GraphInput): VisualState {
  const nodes = Array.from({ length: g.n }, (_, i) =>
    g.n <= 12
      ? {
          id: String(i),
          label: String(i),
          x: 180 + 125 * Math.cos((2 * Math.PI * i) / g.n - Math.PI / 2),
          y: 160 + 125 * Math.sin((2 * Math.PI * i) / g.n - Math.PI / 2),
        }
      : {
          id: String(i),
          label: String(i),
          x: 40 + (i % 8) * 75,
          y: 40 + Math.floor(i / 8) * 75,
        },
  );
  return {
    kind: 'graph',
    values: Array.from({ length: g.n }, (_, i) => i),
    nodes,
    edges: g.edges.map(([u, v, w]) => ({
      from: String(u),
      to: String(v),
      label: String(w),
    })),
    directed: g.directed,
  };
}
export function graphPresets(directed = false) {
  return {
    best: { n: 1, edges: [], directed, start: 0 } as GraphInput,
    average: {
      n: 6,
      edges: [
        [0, 1, 2],
        [0, 2, 5],
        [1, 2, 1],
        [1, 3, 4],
        [2, 4, 2],
        [3, 5, 1],
        [4, 5, 3],
      ],
      directed,
      start: 0,
    } as GraphInput,
    worst: {
      n: 7,
      edges: [
        [0, 1, 1],
        [1, 2, 1],
        [2, 3, 1],
        [3, 4, 1],
        [4, 5, 1],
        [5, 6, 1],
      ],
      directed,
      start: 0,
    } as GraphInput,
    random: (n: number, seed = 42): GraphInput => {
      n = Math.min(16, Math.max(1, n));
      let state = seed >>> 0;
      const edges: [number, number, number][] = [];
      for (let i = 0; i < n - 1; i++) {
        state = (Math.imul(1664525, state) + 1013904223) >>> 0;
        edges.push([i, i + 1, 1 + (state % 9)]);
      }
      for (let i = 0; i < n - 2; i++) {
        state = (Math.imul(1664525, state) + 1013904223) >>> 0;
        if (state % 2) edges.push([i, i + 2, 1 + (state % 9)]);
      }
      return { n, edges, directed, start: 0, target: n - 1 };
    },
  };
}
