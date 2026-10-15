import { withLineMap } from './helpers';
import type { Visualizer, VisualState } from './types';
import { counters, frame, randomNumbers, validateNumbers } from './helpers';
const implementation: Visualizer = {
  id: 'bfs',
  validateInput(raw) {
    const a = validateNumbers(raw);
    if (a.length > 16) throw new Error('Use at most 16 graph nodes.');
    if (new Set(a).size !== a.length)
      throw new Error('Graph labels must be unique.');
    return a;
  },
  presets: {
    best: [1],
    average: [1, 2, 3, 4, 5, 6, 7],
    worst: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    random: (n, s) => {
      const a = randomNumbers(Math.min(n, 16), s);
      return [...new Set(a)];
    },
  },
  complexity: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)',
    space: 'O(V)',
    why: 'Each reachable vertex enters the queue once; every adjacency edge is inspected once.',
  },
  *generate(input) {
    const c = counters(),
      visited = new Set<number>([0]),
      order: number[] = [],
      queue = [0];
    const nodes = input.map((v, i) => ({
      id: String(i),
      label: String(v),
      x: 40 + (i % 4) * 85,
      y: 40 + Math.floor(i / 4) * 80,
    }));
    const edges = input
      .slice(1)
      .map((_, i) => ({ from: String(Math.floor(i / 2)), to: String(i + 1) }));
    const state: VisualState = {
      kind: 'graph',
      values: [...input],
      nodes,
      edges,
    };
    yield frame(
      state,
      'Start at the root and add it to the queue.',
      c,
      1,
      { queue: '0' },
      [{ id: '0', kind: 'queued' }],
    );
    while (queue.length) {
      const current = queue.shift()!;
      order.push(input[current]);
      c.reads++;
      yield frame(
        state,
        `Visit node ${input[current]} before its children.`,
        c,
        3,
        {
          current: input[current],
          queue: queue.map((i) => input[i]).join(', '),
        },
        [{ id: String(current), kind: 'visited' }],
      );
      for (const edge of edges.filter((e) => Number(e.from) === current)) {
        c.comparisons++;
        const next = Number(edge.to);
        if (!visited.has(next)) {
          yield frame(
            state,
            `Node ${input[next]} is an unvisited neighbor.`,
            c,
            4,
            { current: input[current] },
            [{ id: String(next), kind: 'comparing' }],
            {
              prompt: 'Which node joins the queue next?',
              choices: input.filter((_, i) => !visited.has(i)).map(String),
              answer: String(input[next]),
              hint: 'Follow the current node’s edges in left-to-right order.',
            },
          );
          visited.add(next);
          queue.push(next);
          c.writes++;
          yield frame(
            state,
            `Enqueue ${input[next]} for a later visit.`,
            c,
            5,
            { queue: queue.map((i) => input[i]).join(', ') },
            [{ id: String(next), kind: 'queued' }],
          );
        }
      }
    }
    yield frame(
      { ...state, result: order },
      'All reachable nodes were visited in breadth-first order.',
      c,
      6,
      { order: order.join(' → ') },
      input.map((_, i) => ({ id: String(i), kind: 'done' })),
    );
  },
};

export const bfs = withLineMap(implementation, {
  python: { '1': 3, '3': 5, '4': 6, '5': 7, '6': 8 },
  java: { '1': 2 },
  cpp: { '1': 2 },
});
