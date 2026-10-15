import 'server-only';
import type { Visualizer, Frame } from '@/engine/types';
import { frame, counters } from '@/engine/helpers';
import {
  graphState,
  parseGraph,
  graphPresets,
  adjacency,
  type GraphInput,
} from './graph-input';
const hint =
  'Enter {"n":5,"edges":[[0,1,2],[1,2,3],[0,3,1],[3,4,2]],"directed":false,"start":0,"target":4}. Vertices are 0 through n−1.';
function setup(g: GraphInput) {
  const c = counters(),
    base = graphState(g);
  function emit(
    text: string,
    line: number,
    vars: Frame['variables'] = {},
    active = -1,
    action?: Frame['action'],
  ) {
    return frame(
      base,
      text,
      c,
      line,
      vars,
      active < 0 ? [] : [{ id: String(active), kind: 'visited' }],
      action,
    );
  }
  return { c, emit, adj: adjacency(g) };
}
function definition(
  id: string,
  bound: string,
  why: string,
  generate: Visualizer<GraphInput>['generate'],
  options: {
    directed?: boolean;
    undirected?: boolean;
    nonnegative?: boolean;
    limit?: number;
  } = {},
): Visualizer<GraphInput> {
  return {
    id,
    maxSize: options.limit ?? 32,
    inputHint: hint,
    presets: graphPresets(options.directed),
    complexity: {
      best: bound,
      average: bound,
      worst: bound,
      space: 'O(V+E) graph storage plus algorithm state',
      why,
    },
    validateInput(raw) {
      const g = parseGraph(raw, options);
      if (options.undirected && g.directed)
        throw new Error('This algorithm requires an undirected graph.');
      if (options.directed && !g.directed)
        throw new Error('This algorithm requires a directed graph.');
      if (g.n > (options.limit ?? 32))
        throw new Error(
          `Use at most ${options.limit ?? 32} vertices for this trace.`,
        );
      return g;
    },
    generate,
  };
}
export const representations = definition(
  'graph-representations',
  'O(V+E) adjacency list; O(V²) matrix',
  'Lists store only actual outgoing neighbors; matrices allocate every pair, including absent edges. Zero-weight edges require a separate absence marker.',
  function* (g) {
    const { c, emit, adj } = setup(g),
      matrix: (number | null)[][] = Array.from(
        { length: g.n },
        () => Array(g.n).fill(null) as null[],
      );
    yield emit(
      'The same graph can be represented by edges, neighbor lists or a matrix.',
      1,
    );
    for (const [u, v, w] of g.edges) {
      matrix[u][v] = w;
      if (!g.directed) matrix[v][u] = w;
      c.writes += g.directed ? 1 : 2;
      yield emit(
        'Write the edge weight into the corresponding matrix cell.',
        3,
        { from: u, to: v, weight: w },
        u,
      );
    }
    const f = emit(
      'A null matrix cell means no edge; weight zero remains a real edge.',
      6,
    );
    f.state.kind = 'matrix';
    f.state.rows = matrix.map((row) => row.map((v) => v ?? 0));
    f.state.cellLabels = matrix.map((row) =>
      row.map((v) => (v === null ? '∅' : String(v))),
    );
    f.state.result = {
      matrix,
      adjacency: adj.map((a) => a.map(({ to, weight }) => ({ to, weight }))),
    };
    yield f;
  },
);
export function traversal(breadth = true): Visualizer<GraphInput> {
  return definition(
    breadth ? 'bfs' : 'dfs',
    'O(V+E)',
    'Mark each reached vertex once and inspect its outgoing edges. BFS uses FIFO order and gives unweighted shortest-hop distance; DFS follows one branch with a recursive call stack.',
    function* (g) {
      const { c, emit, adj } = setup(g),
        seen = Array(g.n).fill(false) as boolean[],
        frontier = [g.start],
        distance: (number | null)[] = Array(g.n).fill(null) as null[],
        order: number[] = [];
      seen[g.start] = true;
      distance[g.start] = 0;
      yield emit(
        'Mark the start when adding it to the frontier.',
        1,
        { frontier: frontier.join(',') },
        g.start,
      );
      if (!breadth) {
        const calls: number[] = [];
        function* visit(u: number, depth: number): Generator<Frame> {
          seen[u] = true;
          distance[u] = depth;
          order.push(u);
          calls.push(u);
          c.writes += 2;
          const f = emit(
            'Enter the next branch before returning to siblings.',
            3,
            { order: order.join(','), depth },
            u,
          );
          f.callStack = calls.map((v) => `dfs(${v})`);
          yield f;
          for (const { to: v } of adj[u]) {
            c.reads++;
            if (!seen[v]) yield* visit(v, depth + 1);
          }
          calls.pop();
          yield emit(
            'Return after every outgoing neighbor has been considered.',
            5,
            { vertex: u },
            u,
          );
        }
        yield* visit(g.start, 0);
        const f = emit(
          'The DFS tree records discovery depth, not necessarily shortest-hop distance.',
          6,
        );
        f.state.result = { order, distance };
        yield f;
        return;
      }
      let head = 0;
      while (breadth ? head < frontier.length : frontier.length > 0) {
        const u = breadth ? frontier[head++] : frontier.pop()!;
        order.push(u);
        c.reads++;
        yield emit(
          breadth
            ? 'Remove the oldest frontier vertex.'
            : 'Remove the newest frontier vertex.',
          3,
          {
            frontier: (breadth ? frontier.slice(head) : frontier).join(','),
            order: order.join(','),
          },
          u,
          {
            prompt: 'Which frontier discipline is used?',
            choices: ['First in, first out', 'Last in, first out'],
            answer: breadth ? 'First in, first out' : 'Last in, first out',
            hint: breadth
              ? 'BFS explores complete distance layers.'
              : 'DFS follows the most recently discovered branch.',
          },
        );
        const neighbors = breadth ? adj[u] : [...adj[u]].reverse();
        for (const { to: v } of neighbors) {
          c.reads++;
          if (!seen[v]) {
            seen[v] = true;
            distance[v] = (distance[u] ?? 0) + 1;
            frontier.push(v);
            c.writes += 2;
            yield emit(
              'Discover this vertex once and add it to the frontier.',
              5,
              {
                from: u,
                to: v,
                frontier: (breadth ? frontier.slice(head) : frontier).join(','),
              },
              v,
            );
          }
        }
      }
      const f = emit('Unreachable vertices remain outside the traversal.', 6, {
        order: order.join(','),
      });
      f.state.result = { order, distance };
      yield f;
    },
  );
}
export const components = definition(
  'connected-components',
  'O(V+E)',
  'Restart a traversal from every still-unassigned vertex. This lesson computes undirected components, not strongly connected directed components.',
  function* (g) {
    const { c, emit, adj } = setup(g),
      labels = Array(g.n).fill(-1) as number[];
    let count = 0;
    yield emit('Every vertex begins without a component label.', 1);
    for (let start = 0; start < g.n; start++) {
      if (labels[start] >= 0) continue;
      const q = [start];
      labels[start] = count;
      for (let h = 0; h < q.length; h++) {
        const u = q[h];
        yield emit(
          'All vertices reached from this seed share one component.',
          3,
          { component: count, labels: labels.join(',') },
          u,
        );
        for (const { to: v } of adj[u]) {
          c.reads++;
          if (labels[v] === -1) {
            labels[v] = count;
            q.push(v);
            c.writes++;
          }
        }
      }
      count++;
    }
    const f = emit(
      'Every vertex belongs to exactly one connected component.',
      6,
      { count },
    );
    f.state.result = { count, labels };
    yield f;
  },
  { undirected: true },
);
export const bipartite = definition(
  'bipartite-check',
  'O(V+E)',
  'Color every component by BFS parity. A same-color edge, including a self-loop, proves that no two-coloring exists.',
  function* (g) {
    const { c, emit, adj } = setup(g),
      colors = Array(g.n).fill(-1) as number[];
    let conflict: number[] | null = null;
    yield emit('Two colors represent opposite sides of every edge.', 1);
    outer: for (let start = 0; start < g.n; start++) {
      if (colors[start] >= 0) continue;
      colors[start] = 0;
      const q = [start];
      for (let h = 0; h < q.length; h++) {
        const u = q[h];
        for (const { to: v } of adj[u]) {
          c.reads++;
          yield emit(
            'Neighbors must have the opposite color.',
            3,
            { u, v, colorU: colors[u], colorV: colors[v] },
            v,
            {
              prompt: 'Is this edge already a coloring conflict?',
              choices: ['Conflict', 'No conflict yet'],
              answer:
                colors[v] >= 0 && colors[v] === colors[u]
                  ? 'Conflict'
                  : 'No conflict yet',
              hint: 'Two already-colored equal endpoints cannot satisfy an opposite-side edge.',
            },
          );
          if (colors[v] === -1) {
            colors[v] = 1 - colors[u];
            q.push(v);
            c.writes++;
          } else if (colors[v] === colors[u]) {
            conflict = [u, v];
            break outer;
          }
        }
      }
    }
    const f = emit(
      conflict
        ? 'A same-color edge proves the graph non-bipartite.'
        : 'All components admit a consistent two-coloring.',
      6,
    );
    f.state.result = { bipartite: conflict === null, colors, conflict };
    yield f;
  },
  { undirected: true },
);
class DSU {
  parent: number[];
  size: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = Array(n).fill(1) as number[];
  }
  find(x: number) {
    let root = x;
    while (root !== this.parent[root]) root = this.parent[root];
    while (x !== root) {
      const next = this.parent[x];
      this.parent[x] = root;
      x = next;
    }
    return root;
  }
  union(a: number, b: number) {
    a = this.find(a);
    b = this.find(b);
    if (a === b) return false;
    if (this.size[a] < this.size[b]) [a, b] = [b, a];
    this.parent[b] = a;
    this.size[a] += this.size[b];
    return true;
  }
}
export const unionFind = definition(
  'union-find',
  'O((V+E) α(V)) amortized',
  'Union by size bounds tree growth and path compression shortens future finds. A union of already-connected endpoints does not add another component link.',
  function* (g) {
    const { c, emit } = setup(g),
      dsu = new DSU(g.n);
    let count = g.n;
    yield emit('Every vertex starts as its own representative.', 1);
    for (const [u, v] of g.edges) {
      const a = dsu.find(u),
        b = dsu.find(v);
      c.reads += 2;
      yield emit(
        'Compare representatives before merging the sets.',
        3,
        {
          u,
          v,
          representativeU: a,
          representativeV: b,
          parent: dsu.parent.join(','),
        },
        u,
        {
          prompt: 'Will this edge merge two components?',
          choices: ['Merge', 'Already connected'],
          answer: a === b ? 'Already connected' : 'Merge',
          hint: 'Only distinct representatives represent separate sets.',
        },
      );
      if (dsu.union(u, v)) {
        count--;
        c.writes++;
        yield emit(
          'Attach the smaller set under the larger representative.',
          5,
          { parent: dsu.parent.join(','), components: count },
          v,
        );
      }
    }
    const labels = dsu.parent.map((_, i) => dsu.find(i)),
      f = emit(
        'Path compression preserves membership while shortening parent paths.',
        6,
        { count },
      );
    f.state.result = { count, labels, parent: dsu.parent };
    yield f;
  },
  { undirected: true },
);
export const cycle = definition(
  'cycle-detection',
  'O(V+E)',
  'Directed DFS detects an edge to an active recursion-stack vertex. Undirected DFS skips only its incoming edge and detects any other visited neighbor.',
  function* (g) {
    const { c, emit, adj } = setup(g),
      color = Array(g.n).fill(0) as number[];
    let witness: number[] | null = null;
    yield emit('White is unseen, gray is active, black is finished.', 1);
    function* visit(u: number, incoming = -1): Generator<Frame> {
      color[u] = 1;
      c.writes++;
      yield emit(
        'Enter this DFS activation.',
        3,
        { colors: color.join(',') },
        u,
      );
      for (const { to: v, edge } of adj[u]) {
        c.reads++;
        if (!g.directed && edge === incoming) continue;
        if (color[v] === 0) yield* visit(v, edge);
        else if ((g.directed && color[v] === 1) || !g.directed) {
          witness = [u, v];
          yield emit(
            'This edge closes a cycle under the graph’s direction rule.',
            5,
            { from: u, to: v },
            v,
          );
          return;
        }
        if (witness) return;
      }
      color[u] = 2;
      c.writes++;
    }
    for (let u = 0; u < g.n && !witness; u++) if (!color[u]) yield* visit(u);
    const f = emit(
      witness
        ? 'A cycle witness was found.'
        : 'Every DFS component finished without a cycle.',
      6,
    );
    f.state.result = { hasCycle: witness !== null, witness };
    yield f;
  },
);
export function topological(dfs = false): Visualizer<GraphInput> {
  return definition(
    'topological-sort',
    'O(V+E)',
    dfs
      ? 'Reverse DFS finish order is topological exactly when no back edge exists.'
      : 'Kahn’s algorithm removes only zero-indegree vertices. If fewer than V vertices are removed, a directed cycle remains.',
    function* (g) {
      const { c, emit, adj } = setup(g),
        order: number[] = [];
      let hasCycle = false;
      yield emit('A DAG can order every dependency before its dependents.', 1);
      if (dfs) {
        const color = Array(g.n).fill(0) as number[];
        function* visit(u: number): Generator<Frame> {
          color[u] = 1;
          yield emit('Mark this dependency path active.', 3, { vertex: u }, u);
          for (const { to: v } of adj[u]) {
            c.reads++;
            if (color[v] === 1) {
              hasCycle = true;
              yield emit(
                'A back edge prevents a topological order.',
                5,
                { from: u, to: v },
                v,
              );
              return;
            }
            if (!color[v]) yield* visit(v);
            if (hasCycle) return;
          }
          color[u] = 2;
          order.push(u);
          c.writes++;
          yield emit(
            'Append a vertex only after all outgoing descendants finish.',
            5,
            { finish: order.join(',') },
            u,
          );
        }
        for (let u = 0; u < g.n && !hasCycle; u++)
          if (!color[u]) yield* visit(u);
        order.reverse();
      } else {
        const indegree = Array(g.n).fill(0) as number[];
        for (const list of adj) for (const { to: v } of list) indegree[v]++;
        const q = indegree.flatMap((degree, u) => (degree === 0 ? [u] : []));
        for (let h = 0; h < q.length; h++) {
          const u = q[h];
          order.push(u);
          yield emit(
            'Remove the next zero-indegree vertex.',
            3,
            { queue: q.slice(h + 1).join(','), order: order.join(',') },
            u,
          );
          for (const { to: v } of adj[u]) {
            c.reads++;
            indegree[v]--;
            c.writes++;
            if (indegree[v] === 0) q.push(v);
          }
        }
        hasCycle = order.length < g.n;
      }
      const f = emit(
        hasCycle
          ? 'A directed cycle prevents a complete ordering.'
          : 'Every edge points forward in the final order.',
        6,
      );
      f.state.result = { order: hasCycle ? null : order, hasCycle };
      yield f;
    },
    { directed: true },
  );
}
class MinHeap {
  a: { vertex: number; priority: number; distance: number; from: number }[] =
    [];
  constructor(private compare: () => void) {}
  push(item: MinHeap['a'][number]) {
    this.a.push(item);
    let i = this.a.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      this.compare();
      if (this.a[p].priority <= this.a[i].priority) break;
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }
  pop() {
    const first = this.a[0],
      last = this.a.pop()!;
    if (this.a.length) {
      this.a[0] = last;
      let i = 0;
      while (2 * i + 1 < this.a.length) {
        let child = 2 * i + 1;
        if (child + 1 < this.a.length) {
          this.compare();
          if (this.a[child + 1].priority < this.a[child].priority) child++;
        }
        this.compare();
        if (this.a[i].priority <= this.a[child].priority) break;
        [this.a[i], this.a[child]] = [this.a[child], this.a[i]];
        i = child;
      }
    }
    return first;
  }
}
export function shortestPath(astar = false): Visualizer<GraphInput> {
  return definition(
    astar ? 'a-star-search' : 'dijkstra',
    'O((V+E) log(V+E)) with lazy heap entries',
    astar
      ? 'A* prioritizes g+h. The heuristic is Euclidean distance scaled by the smallest edge cost per drawn unit, making it consistent even on custom nonnegative weighted graphs. A zero-cost edge can reduce the heuristic to zero.'
      : 'Dijkstra settles the smallest tentative distance first. Nonnegative edge weights make settled distances final; stale lazy heap entries are discarded.',
    function* (g) {
      const { c, emit, adj } = setup(g),
        dist = Array(g.n).fill(Infinity) as number[],
        previous: (number | null)[] = Array(g.n).fill(null) as null[],
        settled = Array(g.n).fill(false) as boolean[],
        target = g.target ?? g.n - 1,
        positions = graphState(g).nodes!;
      let scale = Infinity;
      for (const [u, v, w] of g.edges) {
        const d = Math.hypot(
          positions[u].x - positions[v].x,
          positions[u].y - positions[v].y,
        );
        if (d > 0) scale = Math.min(scale, w / d);
      }
      if (!Number.isFinite(scale)) scale = 0;
      const heuristic = (u: number) =>
        astar
          ? scale *
            Math.hypot(
              positions[u].x - positions[target].x,
              positions[u].y - positions[target].y,
            )
          : 0;
      const heap = new MinHeap(() => c.comparisons++);
      dist[g.start] = 0;
      heap.push({
        vertex: g.start,
        priority: heuristic(g.start),
        distance: 0,
        from: -1,
      });
      yield emit(
        'Only the start has a finite known distance.',
        1,
        { target, heuristicScale: scale },
        g.start,
      );
      while (heap.a.length) {
        const item = heap.pop(),
          u = item.vertex;
        c.reads++;
        if (settled[u] || item.distance !== dist[u]) continue;
        settled[u] = true;
        yield emit(
          'Settle the live vertex with smallest frontier priority.',
          3,
          {
            u,
            distance: dist[u],
            heuristic: heuristic(u),
            priority: item.priority,
            distances: JSON.stringify(
              dist.map((v) => (Number.isFinite(v) ? v : null)),
            ),
          },
          u,
        );
        if (astar && u === target) break;
        for (const { to: v, weight } of adj[u]) {
          const candidate = dist[u] + weight;
          c.reads++;
          c.comparisons++;
          yield emit(
            'Relax an outgoing edge only if its route improves the known distance.',
            4,
            {
              from: u,
              to: v,
              candidate,
              oldDistance: Number.isFinite(dist[v]) ? dist[v] : null,
            },
            v,
            {
              prompt: 'Does this route improve the tentative distance?',
              choices: ['Relax edge', 'Keep current distance'],
              answer:
                candidate < dist[v] ? 'Relax edge' : 'Keep current distance',
              hint: 'Compare distance[u]+weight against the currently stored distance[v]; an unreachable vertex acts like infinity.',
            },
          );
          if (candidate < dist[v]) {
            dist[v] = candidate;
            previous[v] = u;
            heap.push({
              vertex: v,
              priority: candidate + heuristic(v),
              distance: candidate,
              from: u,
            });
            c.writes += 2;
            yield emit(
              'Record the shorter route and add a fresh heap entry.',
              5,
              { to: v, distance: candidate },
              v,
            );
          }
        }
      }
      const path: number[] = [];
      if (Number.isFinite(dist[target])) {
        for (let u: number | null = target; u !== null; u = previous[u])
          path.push(u);
        path.reverse();
      }
      const f = emit(
        Number.isFinite(dist[target])
          ? 'The target route is shortest under the nonnegative-weight model.'
          : 'The target is unreachable from this start.',
        6,
        { target },
      );
      f.state.result = {
        distances: dist.map((v) => (Number.isFinite(v) ? v : null)),
        previous,
        settled,
        path,
        targetDistance: Number.isFinite(dist[target]) ? dist[target] : null,
      };
      yield f;
    },
    { nonnegative: true },
  );
}
export const bellmanFord = definition(
  'bellman-ford',
  'O(VE)',
  'After pass k, every shortest path using at most k edges is represented. A further improvement after V−1 passes proves a reachable negative cycle; only vertices downstream of such cycles have unbounded-below distance.',
  function* (g) {
    const { c, emit, adj } = setup(g),
      edges = adj.flatMap((list, u) =>
        list.map(({ to, weight }) => [u, to, weight]),
      ),
      dist = Array(g.n).fill(Infinity) as number[];
    dist[g.start] = 0;
    yield emit(
      'Initialize the start distance; all other vertices are unreachable.',
      1,
    );
    for (let pass = 1; pass < g.n; pass++) {
      let changed = false;
      for (const [u, v, w] of edges) {
        c.reads += 2;
        c.comparisons++;
        if (Number.isFinite(dist[u]) && dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          c.writes++;
          changed = true;
          yield emit(
            'One more edge gives a strictly cheaper reachable walk.',
            3,
            { pass, from: u, to: v, distance: dist[v] },
            v,
          );
        }
      }
      yield emit('Finish this full relaxation pass.', 5, { pass, changed });
      if (!changed) break;
    }
    const affected = Array(g.n).fill(false) as boolean[],
      q: number[] = [];
    for (const [u, v, w] of edges)
      if (Number.isFinite(dist[u]) && dist[u] + w < dist[v] && !affected[v]) {
        affected[v] = true;
        q.push(v);
      }
    for (let h = 0; h < q.length; h++)
      for (const { to: v } of adj[q[h]])
        if (!affected[v]) {
          affected[v] = true;
          q.push(v);
        }
    const f = emit(
      q.length
        ? 'Reachable negative cycles make their downstream distances unbounded below.'
        : 'No reachable negative cycle can improve a finalized distance.',
      6,
    );
    f.state.result = {
      distances: dist.map((v, i) =>
        affected[i] ? '-∞' : Number.isFinite(v) ? v : null,
      ),
      negativeCycle: q.length > 0,
      affected,
    };
    yield f;
  },
);
export const floydWarshall = definition(
  'floyd-warshall',
  'O(V³) time; O(V²) distance workspace',
  'The k-th stage allows only vertices 0…k as internal route vertices. Negative diagonal entries identify negative cycles, and pairs that can route through one have no finite shortest distance.',
  function* (g) {
    const { c } = setup(g),
      dist = Array.from({ length: g.n }, (_, u) =>
        Array.from({ length: g.n }, (_, v) => (u === v ? 0 : Infinity)),
      );
    for (const [u, v, w] of g.edges) {
      dist[u][v] = Math.min(dist[u][v], w);
      if (!g.directed) dist[v][u] = Math.min(dist[v][u], w);
    }
    function emit(
      text: string,
      line: number,
      vars: Frame['variables'] = {},
      cell?: [number, number],
    ) {
      return frame(
        {
          kind: 'matrix',
          values: [],
          rows: dist.map((row) => row.map((v) => (Number.isFinite(v) ? v : 0))),
          cellLabels: dist.map((row) =>
            row.map((v) => (Number.isFinite(v) ? String(v) : '∞')),
          ),
        },
        text,
        c,
        line,
        vars,
        cell ? [{ id: cell.join(','), kind: 'moving' }] : [],
      );
    }
    yield emit('Diagonal routes cost zero; absent edges start unreachable.', 1);
    for (let k = 0; k < g.n; k++) {
      for (let u = 0; u < g.n; u++)
        for (let v = 0; v < g.n; v++) {
          c.reads += 3;
          c.comparisons++;
          const candidate = dist[u][k] + dist[k][v];
          if (candidate < dist[u][v]) {
            dist[u][v] = candidate;
            c.writes++;
            yield emit(
              'Routing through the current intermediate vertex improves this pair.',
              3,
              { intermediate: k, from: u, to: v, distance: candidate },
              [u, v],
            );
          }
        }
      yield emit('All pairs now allow this intermediate vertex.', 5, {
        intermediate: k,
      });
    }
    const negative = dist.flatMap((row, k) => (row[k] < 0 ? [k] : []));
    const result = dist.map((row, u) =>
      row.map((d, v) =>
        negative.some(
          (k) => Number.isFinite(dist[u][k]) && Number.isFinite(dist[k][v]),
        )
          ? '-∞'
          : Number.isFinite(d)
            ? d
            : null,
      ),
    );
    const f = emit(
      negative.length
        ? 'Pairs through negative cycles are marked unbounded below.'
        : 'All-pairs distances are complete.',
      6,
    );
    f.state.result = { distances: result, negativeCycleVertices: negative };
    yield f;
  },
  { limit: 16 },
);
export function spanningTree(prim = false): Visualizer<GraphInput> {
  return definition(
    prim ? 'prim-mst' : 'kruskal-mst',
    prim ? 'O((V+E) log(V+E))' : 'O(E log E)',
    'The cut property permits a cheapest edge crossing from a chosen component. Negative weights are valid. A disconnected graph produces a minimum spanning forest, with one tree per component.',
    function* (g) {
      const { c, emit, adj } = setup(g),
        chosen: number[][] = [];
      let total = 0,
        components = g.n;
      yield emit(
        'Choose a minimum forest without closing an undirected cycle.',
        1,
      );
      if (!prim) {
        const dsu = new DSU(g.n),
          edges = [...g.edges].sort((a, b) => {
            c.comparisons++;
            return a[2] - b[2];
          });
        for (const [u, v, w] of edges) {
          const same = dsu.find(u) === dsu.find(v);
          c.reads += 2;
          yield emit(
            'Consider the next edge in increasing weight order.',
            3,
            { from: u, to: v, weight: w },
            u,
            {
              prompt: 'Can the forest accept this edge?',
              choices: ['Accept', 'Skip cycle'],
              answer: same ? 'Skip cycle' : 'Accept',
              hint: 'Two endpoints with the same representative are already connected.',
            },
          );
          if (dsu.union(u, v)) {
            chosen.push([u, v, w]);
            total += w;
            components--;
            c.writes++;
            yield emit(
              'Join two components using their cheapest currently considered edge.',
              5,
              { total, components },
              v,
            );
          }
        }
      } else {
        const seen = Array(g.n).fill(false) as boolean[],
          heap = new MinHeap(() => c.comparisons++);
        components = 0;
        for (let start = 0; start < g.n; start++) {
          if (seen[start]) continue;
          components++;
          heap.push({ vertex: start, priority: 0, distance: 0, from: -1 });
          while (heap.a.length) {
            const item = heap.pop(),
              u = item.vertex;
            if (seen[u]) continue;
            seen[u] = true;
            c.reads++;
            if (item.from !== -1) {
              chosen.push([item.from, u, item.priority]);
              total += item.priority;
              c.writes++;
            }
            yield emit(
              'Add the cheapest frontier edge reaching a new vertex.',
              3,
              { total, components, from: item.from, weight: item.priority },
              u,
            );
            for (const { to: v, weight } of adj[u])
              if (!seen[v])
                heap.push({
                  vertex: v,
                  priority: weight,
                  distance: 0,
                  from: u,
                });
          }
        }
      }
      const f = emit(
        'Each connected component now has a minimum spanning tree.',
        6,
        { total, components },
      );
      f.state.result = { edges: chosen, total, components };
      yield f;
    },
    { undirected: true },
  );
}
export const bridges = definition(
  'bridges-articulation-points',
  'O(V+E)',
  'DFS discovery times and low-link values record whether a subtree can return to an ancestor without its incoming edge. A child low value above its parent discovery time proves a bridge.',
  function* (g) {
    const { c, emit, adj } = setup(g),
      disc = Array(g.n).fill(-1) as number[],
      low = Array(g.n).fill(-1) as number[],
      bridgeEdges: number[][] = [],
      cuts = new Set<number>();
    let time = 0;
    yield emit(
      'Start a DFS forest so disconnected components are included.',
      1,
    );
    function* visit(u: number, incoming = -1): Generator<Frame> {
      disc[u] = low[u] = time++;
      let children = 0;
      yield emit(
        'Record this vertex’s discovery and earliest reachable ancestor.',
        3,
        { discovery: disc[u], low: low[u] },
        u,
      );
      for (const { to: v, edge } of adj[u]) {
        c.reads++;
        if (edge === incoming) continue;
        if (disc[v] === -1) {
          children++;
          yield* visit(v, edge);
          low[u] = Math.min(low[u], low[v]);
          c.writes++;
          if (low[v] > disc[u]) {
            bridgeEdges.push([u, v]);
            yield emit(
              'The child cannot reach this vertex or an ancestor without its tree edge.',
              5,
              {
                parent: u,
                child: v,
                childLow: low[v],
                parentDiscovery: disc[u],
              },
              v,
            );
          }
          if (incoming !== -1 && low[v] >= disc[u]) cuts.add(u);
        } else low[u] = Math.min(low[u], disc[v]);
      }
      if (incoming === -1 && children > 1) cuts.add(u);
    }
    for (let u = 0; u < g.n; u++) if (disc[u] === -1) yield* visit(u);
    const f = emit('Root articulation uses a separate multiple-child rule.', 6);
    f.state.result = {
      bridges: bridgeEdges,
      articulationPoints: [...cuts].sort((a, b) => a - b),
      discovery: disc,
      low,
    };
    yield f;
  },
  { undirected: true },
);
export function strongComponents(tarjan = false): Visualizer<GraphInput> {
  return definition(
    'strongly-connected-components',
    'O(V+E)',
    tarjan
      ? 'Tarjan tracks active vertices and low-link discovery indices. A root with low[u]=index[u] pops one complete strongly connected component.'
      : 'Kosaraju reverses a full DFS finish order, then traverses the transposed graph. Each second-pass reachability region is exactly one strongly connected component.',
    function* (g) {
      const { c, emit, adj } = setup(g),
        labels = Array(g.n).fill(-1) as number[],
        groups: number[][] = [];
      yield emit(
        'Mutual directed reachability defines strongly connected membership.',
        1,
      );
      if (tarjan) {
        const index = Array(g.n).fill(-1) as number[],
          low = Array(g.n).fill(-1) as number[],
          active = Array(g.n).fill(false) as boolean[],
          stack: number[] = [];
        let time = 0;
        function* visit(u: number): Generator<Frame> {
          index[u] = low[u] = time++;
          stack.push(u);
          active[u] = true;
          yield emit(
            'Push an active DFS vertex with its discovery index.',
            3,
            { index: index[u], stack: stack.join(',') },
            u,
          );
          for (const { to: v } of adj[u]) {
            c.reads++;
            if (index[v] === -1) {
              yield* visit(v);
              low[u] = Math.min(low[u], low[v]);
            } else if (active[v]) low[u] = Math.min(low[u], index[v]);
            c.writes++;
          }
          if (low[u] === index[u]) {
            const group: number[] = [];
            let v: number;
            do {
              v = stack.pop()!;
              active[v] = false;
              labels[v] = groups.length;
              group.push(v);
            } while (v !== u);
            groups.push(group);
            yield emit(
              'Pop the full component rooted at this low-link root.',
              5,
              { component: group.join(',') },
              u,
            );
          }
        }
        for (let u = 0; u < g.n; u++) if (index[u] === -1) yield* visit(u);
      } else {
        const seen = Array(g.n).fill(false) as boolean[],
          finish: number[] = [],
          reverse = Array.from({ length: g.n }, () => [] as number[]);
        for (let u = 0; u < g.n; u++)
          for (const { to: v } of adj[u]) reverse[v].push(u);
        function* visit(u: number): Generator<Frame> {
          seen[u] = true;
          for (const { to: v } of adj[u]) {
            c.reads++;
            if (!seen[v]) yield* visit(v);
          }
          finish.push(u);
          c.writes++;
          yield emit(
            'Append this vertex after all directed descendants finish.',
            3,
            { finish: finish.join(',') },
            u,
          );
        }
        for (let u = 0; u < g.n; u++) if (!seen[u]) yield* visit(u);
        for (const seed of finish.reverse()) {
          if (labels[seed] >= 0) continue;
          const stack = [seed],
            group: number[] = [];
          labels[seed] = groups.length;
          while (stack.length) {
            const u = stack.pop()!;
            group.push(u);
            yield emit(
              'Traverse the transpose to collect one mutual-reachability component.',
              5,
              { component: groups.length },
              u,
            );
            for (const v of reverse[u]) {
              c.reads++;
              if (labels[v] === -1) {
                labels[v] = groups.length;
                stack.push(v);
                c.writes++;
              }
            }
          }
          groups.push(group);
        }
      }
      const f = emit(
        'Every vertex belongs to one maximal mutually reachable group.',
        6,
      );
      f.state.result = { count: groups.length, groups, labels };
      yield f;
    },
    { directed: true },
  );
}
export function maxFlow(depthFirst = false): Visualizer<GraphInput> {
  const v = definition(
    'max-flow',
    depthFirst
      ? 'O(E·|f*|) integer-capacity Ford–Fulkerson'
      : 'O(VE²) Edmonds–Karp',
    depthFirst
      ? 'Any residual source-to-sink path can augment integer flow. Reverse residual arcs allow earlier routing decisions to be undone; integer capacities ensure termination.'
      : 'BFS chooses a shortest residual augmenting path in edge count. Reverse arcs cancel previously sent flow, and the final reachable cut certifies the maximum flow.',
    function* (g) {
      type Arc = { to: number; reverse: number; remaining: number };
      const { c, emit } = setup(g),
        arcs = Array.from({ length: g.n }, () => [] as Arc[]),
        original: {
          from: number;
          index: number;
          to: number;
          capacity: number;
        }[] = [],
        source = g.start,
        sink = g.target ?? g.n - 1;
      c.augmentations = 0;
      let total = 0;
      for (const [u, v, capacity] of g.edges) {
        if (u === v) continue;
        const forward = arcs[u].length,
          back = arcs[v].length;
        arcs[u].push({ to: v, reverse: back, remaining: capacity });
        arcs[v].push({ to: u, reverse: forward, remaining: 0 });
        original.push({ from: u, index: forward, to: v, capacity });
      }
      yield emit(
        'Create paired forward and reverse residual arcs for every capacity edge.',
        1,
        { source, sink },
      );
      if (source !== sink)
        while (true) {
          const parent: ({ from: number; index: number } | null)[] = Array(
              g.n,
            ).fill(null) as null[],
            seen = Array(g.n).fill(false) as boolean[],
            frontier = [source];
          seen[source] = true;
          let head = 0;
          while (
            (depthFirst ? frontier.length : head < frontier.length) &&
            !seen[sink]
          ) {
            const u = depthFirst ? frontier.pop()! : frontier[head++];
            for (let index = 0; index < arcs[u].length; index++) {
              const arc = arcs[u][index];
              c.reads++;
              if (arc.remaining > 0 && !seen[arc.to]) {
                seen[arc.to] = true;
                parent[arc.to] = { from: u, index };
                frontier.push(arc.to);
                c.writes++;
              }
            }
          }
          if (!seen[sink]) break;
          let amount = Infinity;
          const path = [sink];
          for (let u = sink; u !== source;) {
            const p = parent[u]!;
            amount = Math.min(amount, arcs[p.from][p.index].remaining);
            u = p.from;
            path.push(u);
          }
          path.reverse();
          yield emit(
            'The path bottleneck bounds the next legal augmentation.',
            3,
            { path: path.join(' → '), bottleneck: amount, total },
            sink,
            {
              prompt: 'How much flow can this path add?',
              choices: [String(amount), String(amount + 1)],
              answer: String(amount),
              hint: 'Use the smallest remaining capacity among all arcs on the path, including reverse arcs.',
            },
          );
          for (let u = sink; u !== source;) {
            const p = parent[u]!,
              arc = arcs[p.from][p.index];
            arc.remaining -= amount;
            arcs[u][arc.reverse].remaining += amount;
            c.writes += 2;
            u = p.from;
          }
          total += amount;
          c.augmentations++;
          yield emit(
            'Decrease forward residual capacity and increase the paired reverse capacity.',
            5,
            { total, amount },
            sink,
          );
        }
      const reachable = Array(g.n).fill(false) as boolean[],
        q = [source];
      reachable[source] = true;
      for (let h = 0; h < q.length; h++)
        for (const arc of arcs[q[h]])
          if (arc.remaining > 0 && !reachable[arc.to]) {
            reachable[arc.to] = true;
            q.push(arc.to);
          }
      const flows = original.map((e) => ({
          from: e.from,
          to: e.to,
          capacity: e.capacity,
          flow: e.capacity - arcs[e.from][e.index].remaining,
        })),
        cut =
          source === sink
            ? 0
            : original
                .filter((e) => reachable[e.from] && !reachable[e.to])
                .reduce((sum, e) => sum + e.capacity, 0);
      const f = emit(
        'With no augmenting path, flow equals the final residual cut capacity.',
        6,
        { total, minCut: cut },
      );
      f.state.result = {
        total,
        flows,
        sourceSide: reachable.flatMap((yes, u) => (yes ? [u] : [])),
        minCut: cut,
      };
      yield f;
    },
    { directed: true, nonnegative: true, limit: 16 },
  );
  v.presets.best = {
    n: 2,
    edges: [[0, 1, 1]],
    directed: true,
    start: 0,
    target: 1,
  };
  return v;
}
