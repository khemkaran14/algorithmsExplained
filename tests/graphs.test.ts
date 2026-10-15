import { it, expect, describe } from 'vitest';
import {
  representations,
  traversal,
  components,
  bipartite,
  unionFind,
  cycle,
  topological,
  shortestPath,
  bellmanFord,
  floydWarshall,
  spanningTree,
  bridges,
  strongComponents,
  maxFlow,
} from '@/server/visualizers/graphs';
import type { Visualizer } from '@/engine/types';
import type { GraphInput } from '@/server/visualizers/graph-input';
const all = [
  representations,
  traversal(),
  traversal(false),
  components,
  bipartite,
  unionFind,
  cycle,
  topological(),
  topological(true),
  shortestPath(),
  shortestPath(true),
  bellmanFord,
  floydWarshall,
  spanningTree(),
  spanningTree(true),
  bridges,
  strongComponents(),
  strongComponents(true),
  maxFlow(),
  maxFlow(true),
];
describe.each(all as Visualizer<GraphInput>[])('$id', (v) => {
  it('has deterministic immutable serializable preset traces', () => {
    for (const raw of [
      v.presets.best,
      v.presets.average,
      v.presets.worst,
      v.presets.random(8, 42),
    ]) {
      const input = v.validateInput(raw),
        before = structuredClone(input),
        frames = [...v.generate(input)];
      expect(frames.length).toBeGreaterThan(1);
      expect(frames).toEqual([...v.generate(input)]);
      expect(input).toEqual(before);
      expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
    }
  });
});
function input(
  n: number,
  edges: number[][],
  directed = false,
  start = 0,
  target = n - 1,
): GraphInput {
  return {
    n,
    edges: edges.map((e) => [e[0], e[1], e[2] ?? 1]),
    directed,
    start,
    target,
  };
}
function result<T>(v: Visualizer<GraphInput>, g: GraphInput): T {
  return [...v.generate(v.validateInput(g))].at(-1)!.state.result as T;
}
it('BFS computes hop distances through general cyclic/disconnected graphs', () => {
  expect(
    result(
      traversal(),
      input(6, [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 3],
        [3, 4],
      ]),
    ),
  ).toEqual({ order: [0, 1, 2, 3, 4], distance: [0, 1, 1, 2, 3, null] });
});
it('DFS follows a branch fully before visiting its siblings', () => {
  expect(
    result<{ order: number[] }>(
      traversal(false),
      input(4, [
        [0, 1],
        [0, 2],
        [1, 2],
        [1, 3],
      ]),
    ).order,
  ).toEqual([0, 1, 2, 3]);
});
it('components and DSU agree on disconnected graphs including self-loops', () => {
  const g = input(6, [
    [0, 1],
    [1, 2],
    [3, 4],
    [5, 5],
  ]);
  expect(result(components, g)).toMatchObject({ count: 3 });
  expect(result(unionFind, g)).toMatchObject({ count: 3 });
});
it.each([false, true])(
  'cycle detection handles directed=%s edge cases',
  (directed) => {
    expect(
      result(
        cycle,
        input(
          3,
          [
            [0, 1],
            [1, 2],
          ],
          directed,
        ),
      ),
    ).toMatchObject({ hasCycle: false });
    expect(
      result(
        cycle,
        input(
          3,
          [
            [0, 1],
            [1, 2],
            [2, 0],
          ],
          directed,
        ),
      ),
    ).toMatchObject({ hasCycle: true });
    expect(result(cycle, input(1, [[0, 0]], directed))).toMatchObject({
      hasCycle: true,
    });
  },
);
it('bipartite coloring rejects odd cycles and self-loops across components', () => {
  expect(
    result(
      bipartite,
      input(4, [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ]),
    ),
  ).toMatchObject({ bipartite: true });
  expect(
    result(
      bipartite,
      input(3, [
        [0, 1],
        [1, 2],
        [2, 0],
      ]),
    ),
  ).toMatchObject({ bipartite: false });
  expect(result(bipartite, input(4, [[3, 3]]))).toMatchObject({
    bipartite: false,
  });
});
it.each([false, true])(
  'topological DFS=%s respects all dependencies and detects cycles',
  (dfs) => {
    const edges = [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 3],
      ],
      r = result<{ order: number[]; hasCycle: boolean }>(
        topological(dfs),
        input(4, edges, true),
      );
    expect(r.hasCycle).toBe(false);
    for (const [u, v] of edges)
      expect(r.order.indexOf(u)).toBeLessThan(r.order.indexOf(v));
    expect(
      result(
        topological(dfs),
        input(
          3,
          [
            [0, 1],
            [1, 2],
            [2, 0],
          ],
          true,
        ),
      ),
    ).toEqual({ order: null, hasCycle: true });
  },
);
it('nonnegative shortest paths agree across Dijkstra, A*, Bellman-Ford and Floyd', () => {
  for (let seed = 1; seed <= 10; seed++) {
    const edges: number[][] = [];
    for (let u = 0; u < 7; u++)
      for (let v = 0; v < 7; v++)
        if (u !== v && (u * 13 + v * 7 + seed) % 5 === 0)
          edges.push([u, v, (u + v + seed) % 9]);
    const g = input(7, edges, true),
      d = result<{ distances: (number | null)[] }>(shortestPath(), g),
      b = result<{ distances: (number | null)[] }>(bellmanFord, g),
      f = result<{ distances: (number | null)[][] }>(floydWarshall, g);
    expect(d.distances).toEqual(b.distances);
    expect(d.distances).toEqual(f.distances[0]);
    for (let target = 0; target < 7; target++)
      expect(
        result<{ targetDistance: number | null }>(shortestPath(true), {
          ...g,
          target,
        }).targetDistance,
      ).toBe(d.distances[target]);
  }
});
it('negative cycles affect only reachable downstream distances', () => {
  const g = input(
    6,
    [
      [0, 1, 1],
      [1, 2, -3],
      [2, 1, 1],
      [2, 3, 2],
      [4, 5, -2],
      [5, 4, 1],
    ],
    true,
  );
  expect(result(bellmanFord, g)).toMatchObject({
    negativeCycle: true,
    distances: [0, '-∞', '-∞', '-∞', null, null],
  });
  const f = result<{ distances: (number | string | null)[][] }>(
    floydWarshall,
    g,
  );
  expect(f.distances[0]).toEqual([0, '-∞', '-∞', '-∞', null, null]);
  expect(f.distances[4][5]).toBe('-∞');
  expect(() => shortestPath().validateInput(g)).toThrow();
});
it('Prim and Kruskal agree on a minimum forest with negative weights', () => {
  const g = input(6, [
    [0, 1, -2],
    [1, 2, 1],
    [0, 2, 4],
    [3, 4, 3],
  ]);
  for (const prim of [false, true])
    expect(result(spanningTree(prim), g)).toMatchObject({
      total: 2,
      components: 3,
    });
});
it('low-link search finds bridges and articulation roots in disconnected graphs', () => {
  expect(
    result(
      bridges,
      input(7, [
        [0, 1],
        [1, 2],
        [2, 0],
        [1, 3],
        [4, 5],
        [4, 6],
      ]),
    ),
  ).toMatchObject({
    bridges: [
      [1, 3],
      [4, 5],
      [4, 6],
    ],
    articulationPoints: [1, 4],
  });
});
it('Kosaraju and Tarjan find the same mutual reachability partition', () => {
  const g = input(
    7,
    [
      [0, 1],
      [1, 2],
      [2, 0],
      [2, 3],
      [3, 4],
      [4, 3],
      [4, 5],
    ],
    true,
  );
  for (const tarjan of [false, true]) {
    const r = result<{ groups: number[][] }>(strongComponents(tarjan), g);
    expect(
      r.groups.map((a) => a.sort((a, b) => a - b)).sort((a, b) => a[0] - b[0]),
    ).toEqual([[0, 1, 2], [3, 4], [5], [6]]);
  }
});
it.each([false, true])(
  'max-flow DFS=%s matches min cut and conserves antiparallel flow',
  (dfs) => {
    const g = input(
      6,
      [
        [0, 1, 16],
        [0, 2, 13],
        [1, 2, 10],
        [2, 1, 4],
        [1, 3, 12],
        [3, 2, 9],
        [2, 4, 14],
        [4, 3, 7],
        [3, 5, 20],
        [4, 5, 4],
      ],
      true,
    );
    const r = result<{
      total: number;
      minCut: number;
      flows: { from: number; to: number; capacity: number; flow: number }[];
    }>(maxFlow(dfs), g);
    expect(r.total).toBe(23);
    expect(r.minCut).toBe(23);
    const net = Array(6).fill(0) as number[];
    for (const e of r.flows) {
      expect(e.flow).toBeGreaterThanOrEqual(0);
      expect(e.flow).toBeLessThanOrEqual(e.capacity);
      net[e.from] -= e.flow;
      net[e.to] += e.flow;
    }
    expect(net).toEqual([-23, 0, 0, 0, 0, 23]);
  },
);
it('keeps matrix zero-weight edges distinct from absent edges', () => {
  expect(result(representations, input(2, [[0, 1, 0]], true))).toMatchObject({
    matrix: [
      [null, 0],
      [null, null],
    ],
  });
});
