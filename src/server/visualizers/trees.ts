import 'server-only';
import { z } from 'zod';
import type { Visualizer, Frame, VisualState } from '@/engine/types';
import {
  frame,
  counters,
  validateNumbers,
  randomNumbers,
  arrayPresets,
} from '@/engine/helpers';
type Node = {
  key: number;
  left: Node | null;
  right: Node | null;
  height: number;
  red: boolean;
};
function node(key: number): Node {
  return { key, left: null, right: null, height: 1, red: true };
}
const height = (n: Node | null): number => n?.height ?? 0;
const update = (n: Node) => {
  n.height = 1 + Math.max(height(n.left), height(n.right));
  return n;
};
function rotateLeft(h: Node) {
  const x = h.right!;
  h.right = x.left;
  x.left = h;
  x.red = h.red;
  h.red = true;
  update(h);
  return update(x);
}
function rotateRight(h: Node) {
  const x = h.left!;
  h.left = x.right;
  x.right = h;
  x.red = h.red;
  h.red = true;
  update(h);
  return update(x);
}
function sorted(root: Node | null): number[] {
  return root ? [...sorted(root.left), root.key, ...sorted(root.right)] : [];
}
function scene(root: Node | null, redBlack = false): VisualState {
  const nodes: NonNullable<VisualState['nodes']> = [],
    edges: NonNullable<VisualState['edges']> = [];
  let x = 0;
  function walk(n: Node | null, d: number) {
    if (!n) return;
    walk(n.left, d + 1);
    nodes.push({
      id: String(n.key),
      label: `${n.key}${redBlack ? (n.red ? ' R' : ' B') : ''}`,
      x: 40 + 55 * x++,
      y: 40 + 70 * d,
    });
    if (n.left) edges.push({ from: String(n.key), to: String(n.left.key) });
    if (n.right) edges.push({ from: String(n.key), to: String(n.right.key) });
    walk(n.right, d + 1);
  }
  walk(root, 0);
  return { kind: 'tree', values: sorted(root), nodes, edges };
}
export function searchTree(mode: 'bst' | 'avl' | 'red-black'): Visualizer {
  return {
    id: mode === 'bst' ? 'binary-search-tree' : `${mode}-tree`,
    maxSize: 32,
    inputHint:
      'Enter an integer array. Duplicates use set semantics. BST also searches for and deletes the middle input key.',
    presets: {
      ...arrayPresets(),
      random: (n, s) => randomNumbers(Math.min(n, 32), s),
    },
    validateInput(raw) {
      const a = validateNumbers(raw);
      if (a.length > 32)
        throw new Error('Use at most 32 keys for a readable tree.');
      return a;
    },
    complexity: {
      metric: {
        label: 'Key comparisons and rotations',
        keys: ['comparisons', 'rotations'],
      },
      best: 'O(log n) balanced operation',
      average:
        mode === 'bst'
          ? 'O(log n) for random distinct insertion order'
          : 'O(log n)',
      worst: mode === 'bst' ? 'O(n) degenerate tree' : 'O(log n)',
      space: 'O(n) tree, O(h) recursive stack',
      why:
        mode === 'bst'
          ? 'BST ordering narrows one subtree per comparison; sorted input can create a chain.'
          : mode === 'avl'
            ? 'Rotations restore a height difference of at most one after every insertion.'
            : 'Left-leaning red-black insertion represents 2–3 tree links using color flips and rotations; equal black heights bound tree height.',
    },
    *generate(input) {
      let root: Node | null = null;
      const c = counters();
      c.rotations = 0;
      c.colorFlips = 0;
      const emit = (
        text: string,
        line: number,
        vars: Frame['variables'] = {},
        active?: number,
        action?: Frame['action'],
      ) =>
        frame(
          scene(root, mode === 'red-black'),
          text,
          c,
          line,
          vars,
          active === undefined
            ? []
            : [{ id: String(active), kind: 'comparing' }],
          action,
        );
      yield emit('Start with an empty ordered tree.', 1);
      function* insert(h: Node | null, key: number): Generator<Frame, Node> {
        if (!h) {
          c.writes++;
          return node(key);
        }
        c.comparisons++;
        c.reads++;
        yield emit(
          'Compare the incoming key with this subtree root.',
          3,
          { key, at: h.key },
          h.key,
          {
            prompt: 'Where does this key belong?',
            choices: ['Left subtree', 'Right subtree', 'Already present'],
            answer:
              key < h.key
                ? 'Left subtree'
                : key > h.key
                  ? 'Right subtree'
                  : 'Already present',
            hint: 'Smaller keys go left, larger keys right, and duplicates keep one stored key.',
          },
        );
        if (key < h.key) h.left = yield* insert(h.left, key);
        else if (key > h.key) h.right = yield* insert(h.right, key);
        else return h;
        update(h);
        if (mode === 'avl') {
          const balance = height(h.left) - height(h.right);
          if (balance > 1) {
            if (key > h.left!.key) {
              h.left = rotateLeft(h.left!);
              c.rotations++;
            }
            h = rotateRight(h);
            c.rotations++;
          } else if (balance < -1) {
            if (key < h.right!.key) {
              h.right = rotateRight(h.right!);
              c.rotations++;
            }
            h = rotateLeft(h);
            c.rotations++;
          }
        }
        if (mode === 'red-black') {
          if (h.right?.red && !h.left?.red) {
            h = rotateLeft(h);
            c.rotations++;
          }
          if (h.left?.red && h.left.left?.red) {
            h = rotateRight(h);
            c.rotations++;
          }
          if (h.left?.red && h.right?.red) {
            h.red = !h.red;
            h.left.red = !h.left.red;
            h.right.red = !h.right.red;
            c.colorFlips++;
          }
        }
        return update(h);
      }
      for (const key of input) {
        root = yield* insert(root, key);
        root.red = false;
        yield emit(
          'Commit the inserted key and restore the tree invariants.',
          5,
          { key, height: root.height, rotations: c.rotations },
        );
      }
      if (mode === 'bst') {
        const target = input[Math.floor(input.length / 2)];
        let at: Node | null = root;
        while (at) {
          c.comparisons++;
          yield emit(
            'Search follows the same ordering comparisons as insertion.',
            3,
            { target, at: at.key },
            at.key,
          );
          if (at.key === target) break;
          at = target < at.key ? at.left : at.right;
        }
        function remove(h: Node | null, key: number): Node | null {
          if (!h) return null;
          c.comparisons++;
          if (key < h.key) h.left = remove(h.left, key);
          else if (key > h.key) h.right = remove(h.right, key);
          else {
            c.writes++;
            if (!h.left) return h.right;
            if (!h.right) return h.left;
            let successor = h.right;
            while (successor.left) {
              successor = successor.left;
              c.reads++;
            }
            h.key = successor.key;
            h.right = remove(h.right, successor.key);
          }
          return update(h);
        }
        root = remove(root, target);
        yield emit(
          'Delete the searched key; a two-child node takes its inorder successor.',
          5,
          { deleted: target },
        );
      }
      const f = emit('Inorder traversal exposes the final sorted set.', 6, {
        height: height(root),
      });
      f.state.result = {
        keys: sorted(root),
        root: root as unknown as import('@/engine/types').JsonValue,
      };
      yield f;
    },
  };
}
const traversalSchema = z.object({
  values: z.array(z.number().int().min(-999).max(999)).min(1).max(31),
  order: z.enum(['pre', 'in', 'post', 'level']).default('in'),
});
export const traversals: Visualizer<z.infer<typeof traversalSchema>> = {
  id: 'binary-tree-traversals',
  maxSize: 31,
  inputHint:
    'Enter {"values":[4,2,6,1,3,5,7],"order":"in"}. Values describe a complete binary tree in level order; order is pre/in/post/level.',
  presets: {
    best: { values: [1], order: 'in' },
    average: { values: [4, 2, 6, 1, 3, 5, 7], order: 'in' },
    worst: { values: [1, 2, 3, 4, 5, 6, 7], order: 'post' },
    random: (n, s) => ({
      values: randomNumbers(Math.min(n, 31), s),
      order: 'level',
    }),
  },
  validateInput(raw) {
    return traversalSchema.parse(raw);
  },
  complexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(h) DFS stack; O(w) BFS queue',
    why: 'Every node is visited once. DFS changes when the root is emitted; level order uses a FIFO frontier.',
  },
  *generate({ values, order }) {
    const c = counters(),
      output: number[] = [],
      nodes = values.map((key, i) => ({
        id: String(i),
        label: String(key),
        x:
          30 +
          (i - 2 ** Math.floor(Math.log2(i + 1)) + 1 + 0.5) *
            (480 / 2 ** Math.floor(Math.log2(i + 1))),
        y: 40 + 65 * Math.floor(Math.log2(i + 1)),
      })),
      edges = values.flatMap((_, i) =>
        i ? [{ from: String(Math.floor((i - 1) / 2)), to: String(i) }] : [],
      );
    const emit = (i: number, line: number) =>
      frame(
        { kind: 'tree', values, nodes, edges, result: [...output] },
        'Visit the next node in the selected traversal order.',
        c,
        line,
        { order, output: output.join(', ') },
        i >= 0 ? [{ id: String(i), kind: 'visited' }] : [],
      );
    yield emit(-1, 1);
    function* visit(i: number): Generator<Frame> {
      if (i >= values.length) return;
      c.reads++;
      if (order === 'pre') {
        output.push(values[i]);
        yield emit(i, 3);
      }
      yield* visit(2 * i + 1);
      if (order === 'in') {
        output.push(values[i]);
        yield emit(i, 4);
      }
      yield* visit(2 * i + 2);
      if (order === 'post') {
        output.push(values[i]);
        yield emit(i, 5);
      }
    }
    if (order === 'level') {
      for (let i = 0; i < values.length; i++) {
        c.reads++;
        output.push(values[i]);
        yield emit(i, 3);
      }
    } else yield* visit(0);
    yield emit(-1, 6);
  },
};
export function heapVisualizer(bottomUp = false): Visualizer {
  return {
    id: bottomUp ? 'heapify' : 'heap-priority-queue',
    presets: arrayPresets(),
    validateInput: validateNumbers,
    inputHint: bottomUp
      ? 'Enter an integer array. Bottom-up max-heapify repairs internal nodes from right to left.'
      : 'Enter an integer array. Insertions swim upward; repeated removals sink the replacement root.',
    complexity: {
      best: bottomUp ? 'O(n) build' : 'O(1) peek',
      average: bottomUp ? 'O(n) build' : 'O(log n) insert/extract',
      worst: bottomUp ? 'O(n) build' : 'O(log n) insert/extract',
      space: 'O(n) backing array; O(1) repair workspace',
      why: bottomUp
        ? 'Most nodes are near the leaves and require little sinking; summing height-weighted counts gives linear heap construction.'
        : 'A complete tree has logarithmic height, so swimming and sinking follow at most one root-to-leaf path.',
    },
    *generate(input) {
      const a = bottomUp ? [...input] : [],
        output: number[] = [],
        c = counters();
      function emit(
        text: string,
        line: number,
        active = -1,
        vars: Frame['variables'] = {},
        action?: Frame['action'],
      ) {
        const nodes = a.map((key, i) => ({
            id: String(i),
            label: String(key),
            x:
              30 +
              (i - 2 ** Math.floor(Math.log2(i + 1)) + 1 + 0.5) *
                Math.max(32, 480 / 2 ** Math.floor(Math.log2(i + 1))),
            y: 40 + 65 * Math.floor(Math.log2(i + 1)),
          })),
          edges = a.flatMap((_, i) =>
            i ? [{ from: String(Math.floor((i - 1) / 2)), to: String(i) }] : [],
          );
        return frame(
          { kind: 'heap', values: a, nodes, edges },
          text,
          c,
          line,
          vars,
          active >= 0 ? [{ id: String(active), kind: 'comparing' }] : [],
          action,
        );
      }
      function* sink(start: number): Generator<Frame> {
        let i = start;
        while (2 * i + 1 < a.length) {
          let child = 2 * i + 1;
          if (child + 1 < a.length) {
            c.comparisons++;
            c.reads += 2;
            if (a[child + 1] > a[child]) child++;
          }
          c.comparisons++;
          c.reads += 2;
          yield emit(
            'The parent must dominate the larger child.',
            3,
            i,
            { parent: a[i], child: a[child] },
            {
              prompt: 'Does the parent need to sink?',
              choices: ['Swap with larger child', 'Heap order already holds'],
              answer:
                a[i] < a[child]
                  ? 'Swap with larger child'
                  : 'Heap order already holds',
              hint: 'This is a max heap, so every parent must be at least its children.',
            },
          );
          if (a[i] >= a[child]) break;
          [a[i], a[child]] = [a[child], a[i]];
          c.swaps++;
          c.writes += 2;
          i = child;
          yield emit(
            'Repair one level and continue down the complete tree.',
            5,
            i,
          );
        }
      }
      yield emit('A heap stores a complete tree in a compact array.', 1);
      if (bottomUp) {
        for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) yield* sink(i);
      } else {
        for (const key of input) {
          a.push(key);
          c.writes++;
          let i = a.length - 1;
          while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            c.comparisons++;
            c.reads += 2;
            if (a[parent] >= a[i]) break;
            [a[parent], a[i]] = [a[i], a[parent]];
            c.swaps++;
            c.writes += 2;
            i = parent;
            yield emit('Swim the new key above a smaller parent.', 3, i);
          }
          yield emit(
            'Insertion preserves complete shape and max-heap order.',
            5,
            i,
          );
        }
        while (a.length) {
          output.push(a[0]);
          const last = a.pop()!;
          c.reads++;
          c.writes++;
          if (a.length) {
            a[0] = last;
            c.writes++;
            yield* sink(0);
          }
          yield emit(
            'Extract the maximum and repair the replacement root.',
            5,
            -1,
            { output: output.join(', ') },
          );
        }
      }
      const f = emit('Every retained parent dominates its children.', 6);
      f.state.result = bottomUp ? [...a] : output;
      yield f;
    },
  };
}
const trieSchema = z.object({
  words: z
    .array(
      z
        .string()
        .min(1)
        .max(12)
        .regex(/^[a-z]+$/),
    )
    .min(1)
    .max(16),
  query: z
    .string()
    .max(12)
    .regex(/^[a-z]*$/),
  prefix: z.boolean().default(false),
});
export const trie: Visualizer<z.infer<typeof trieSchema>> = {
  id: 'trie',
  maxSize: 16,
  inputHint:
    'Enter {"words":["cat","car","dog"],"query":"ca","prefix":true}. Use lowercase ASCII words.',
  presets: {
    best: { words: ['a'], query: 'a', prefix: false },
    average: { words: ['cat', 'car', 'dog'], query: 'ca', prefix: true },
    worst: {
      words: ['aaaaaaaaaaaa', 'aaaaaaaaaaab'],
      query: 'aaaaaaaaaaac',
      prefix: false,
    },
    random: (n, s) => ({
      words: randomNumbers(Math.min(n, 16), s).map((v, i) =>
        String.fromCharCode(97 + (v % 26), 97 + (i % 26)),
      ),
      query: 'a',
      prefix: true,
    }),
  },
  validateInput(raw) {
    return trieSchema.parse(raw);
  },
  complexity: {
    best: 'O(1) early missing edge',
    average: 'O(L) insert/search',
    worst: 'O(L)',
    space: 'O(total stored characters)',
    why: 'Each edge consumes one character, independent of the total number of words. A terminal marker distinguishes whole-word membership from a prefix.',
  },
  *generate({ words, query, prefix }) {
    type T = { terminal: boolean; children: Map<string, T> };
    const root: T = { terminal: false, children: new Map() },
      c = counters();
    function emit(
      text: string,
      line: number,
      active = '',
      vars: Frame['variables'] = {},
      action?: Frame['action'],
    ) {
      const nodes: NonNullable<VisualState['nodes']> = [],
        edges: NonNullable<VisualState['edges']> = [];
      let x = 0;
      function walk(n: T, path: string) {
        const descendants = [...n.children];
        const start = x;
        if (!descendants.length) x++;
        for (const [ch, next] of descendants) {
          edges.push({ from: path, to: path + ch, label: ch });
          walk(next, path + ch);
        }
        nodes.push({
          id: path,
          label: (path ? path.at(-1) : 'root') + (n.terminal ? '*' : ''),
          x: 35 + ((start + x - 1) / 2) * 55,
          y: 40 + path.length * 60,
        });
      }
      walk(root, '');
      return frame(
        { kind: 'tree', values: [], nodes, edges },
        text,
        c,
        line,
        vars,
        [{ id: active, kind: 'visited' }],
        action,
      );
    }
    yield emit(
      'The empty root shares prefixes without representing a stored word.',
      1,
    );
    for (const word of words) {
      let at = root,
        path = '';
      for (const ch of word) {
        c.reads++;
        if (!at.children.has(ch)) {
          at.children.set(ch, { terminal: false, children: new Map() });
          c.writes++;
        }
        at = at.children.get(ch)!;
        path += ch;
        yield emit('Follow or create the next character edge.', 3, path, {
          word,
        });
      }
      at.terminal = true;
      c.writes++;
      yield emit(
        'Mark the full word terminal without changing shorter prefixes.',
        5,
        path,
        { word },
      );
    }
    let at: T | undefined = root,
      path = '';
    for (const ch of query) {
      const exists = at.children.has(ch);
      c.reads++;
      yield emit(
        'Check whether the next query character has an edge.',
        3,
        path,
        { query, next: ch },
        {
          prompt: 'Can the query continue?',
          choices: ['Follow edge', 'No matching edge'],
          answer: exists ? 'Follow edge' : 'No matching edge',
          hint: 'Only children with the next exact character can continue a trie search.',
        },
      );
      at = at.children.get(ch);
      if (!at) break;
      path += ch;
    }
    const found = !!at && (prefix || at.terminal);
    const f = emit(
      found
        ? 'The requested word or prefix exists.'
        : 'The requested word or prefix is absent.',
      6,
      path,
      { prefix, found },
    );
    f.state.result = found;
    yield f;
  },
};
const rangeSchema = z.object({
  values: z.array(z.number().int().min(-99).max(99)).min(1).max(32),
  left: z.number().int().min(0),
  right: z.number().int().min(0),
  update: z.object({
    index: z.number().int().min(0),
    delta: z.number().int().min(-99).max(99),
  }),
});
type RangeInput = z.infer<typeof rangeSchema>;
export function rangeTree(fenwick = false): Visualizer<RangeInput> {
  return {
    id: fenwick ? 'fenwick-tree' : 'segment-tree',
    maxSize: 32,
    inputHint:
      'Enter {"values":[1,2,3,4],"left":1,"right":4,"update":{"index":2,"delta":5}}. Query is half-open [left,right), after one point-add update.',
    presets: {
      best: { values: [1], left: 0, right: 1, update: { index: 0, delta: 2 } },
      average: {
        values: [1, 2, 3, 4, 5, 6, 7, 8],
        left: 2,
        right: 7,
        update: { index: 3, delta: 5 },
      },
      worst: {
        values: [1, 2, 3, 4, 5, 6, 7, 8],
        left: 1,
        right: 7,
        update: { index: 0, delta: -1 },
      },
      random: (n, s) => {
        const values = randomNumbers(Math.min(n, 32), s);
        return {
          values,
          left: 0,
          right: values.length,
          update: { index: 0, delta: 1 },
        };
      },
    },
    validateInput(raw) {
      const p = rangeSchema.parse(raw);
      if (
        p.left > p.right ||
        p.right > p.values.length ||
        p.update.index >= p.values.length
      )
        throw new Error(
          'Use 0 ≤ left ≤ right ≤ length and an update index inside the array.',
        );
      return p;
    },
    complexity: {
      best: 'O(log n) update/query',
      average: 'O(log n)',
      worst: 'O(log n)',
      space: 'O(n)',
      why: fenwick
        ? 'One-based index low bits identify disjoint prefix blocks. Updates add the lowest set bit; prefix queries subtract it. Range sum is prefix(right)−prefix(left).'
        : 'A complete binary segment tree partitions the range into disjoint powers of two. A point update repairs one ancestor path; a range query uses O(log n) boundary nodes.',
    },
    *generate(input) {
      const values = [...input.values],
        c = counters();
      c.visits = 0;
      const n = values.length;
      let base = 1;
      while (base < n) base *= 2;
      const tree = Array(fenwick ? n + 1 : 2 * base).fill(0) as number[];
      function emit(
        text: string,
        line: number,
        active = -1,
        vars: Frame['variables'] = {},
        action?: Frame['action'],
      ) {
        return frame(
          {
            kind: 'boxes',
            values: tree,
            labels: tree.map((v, i) => `${i}:${v}`),
          },
          text,
          c,
          line,
          { ...vars, source: values.join(', ') },
          active >= 0 ? [{ id: String(active), kind: 'comparing' }] : [],
          action,
        );
      }
      yield emit('Allocate a bounded range-sum index.', 1);
      if (fenwick) {
        for (let i = 1; i <= n; i++) {
          tree[i] += values[i - 1];
          const parent = i + (i & -i);
          if (parent <= n) tree[parent] += tree[i];
          c.reads++;
          c.writes++;
          yield emit(
            'Build each low-bit block and pass its sum to its parent.',
            2,
            i,
          );
        }
      } else {
        for (let i = 0; i < n; i++) tree[base + i] = values[i];
        for (let i = base - 1; i > 0; i--) {
          tree[i] = tree[2 * i] + tree[2 * i + 1];
          c.reads += 2;
          c.writes++;
          yield emit('Build an internal interval from its two children.', 2, i);
        }
      }
      values[input.update.index] += input.update.delta;
      if (fenwick) {
        for (let i = input.update.index + 1; i <= n; i += i & -i) {
          tree[i] += input.update.delta;
          c.writes++;
          c.visits++;
          yield emit(
            'Add the delta to every Fenwick block containing this position.',
            3,
            i,
            { index: i, lowbit: i & -i },
            {
              prompt: 'Which index receives the next update?',
              choices: [String(i + (i & -i)), String(i - (i & -i))],
              answer: String(i + (i & -i)),
              hint: 'Update moves upward using i += i & -i.',
            },
          );
        }
      } else {
        let i = base + input.update.index;
        tree[i] = values[input.update.index];
        c.writes++;
        while (i > 1) {
          i = Math.floor(i / 2);
          tree[i] = tree[2 * i] + tree[2 * i + 1];
          c.writes++;
          c.reads += 2;
          c.visits++;
          yield emit('Repair the updated leaf’s ancestors.', 3, i);
        }
      }
      let sum = 0;
      if (fenwick) {
        for (const [end, sign] of [
          [input.right, 1],
          [input.left, -1],
        ])
          for (let i = end; i > 0; i -= i & -i) {
            sum += sign * tree[i];
            c.reads++;
            c.visits++;
            yield emit('Consume a disjoint low-bit prefix block.', 4, i, {
              sum,
              sign,
              index: i,
            });
          }
      } else {
        let left = input.left + base,
          right = input.right + base;
        while (left < right) {
          if (left % 2) {
            sum += tree[left];
            c.reads++;
            c.visits++;
            yield emit(
              'Take the left boundary block wholly inside the query.',
              4,
              left,
              { sum },
            );
            left++;
          }
          if (right % 2) {
            right--;
            sum += tree[right];
            c.reads++;
            c.visits++;
            yield emit(
              'Take the right boundary block wholly inside the query.',
              4,
              right,
              { sum },
            );
          }
          left = Math.floor(left / 2);
          right = Math.floor(right / 2);
        }
      }
      const f = emit(
        'The selected disjoint blocks equal the updated half-open range sum.',
        6,
        -1,
        { sum },
      );
      f.state.result = { sum, values, index: tree };
      yield f;
    },
  };
}
const rootedSchema = z.object({
  parents: z.array(z.number().int().min(-1).max(31)).min(1).max(32),
  a: z.number().int().min(0),
  b: z.number().int().min(0),
});
type RootedInput = z.infer<typeof rootedSchema>;
function rooted(raw: unknown): RootedInput {
  const p = rootedSchema.parse(raw);
  if (
    p.parents[0] !== -1 ||
    p.parents.some((parent, i) => i > 0 && (parent < 0 || parent >= i)) ||
    p.a >= p.parents.length ||
    p.b >= p.parents.length
  )
    throw new Error(
      'Root zero has parent -1; every other parent must have a smaller index. a and b must exist.',
    );
  return p;
}
export function treeRelation(diameter = false): Visualizer<RootedInput> {
  return {
    id: diameter ? 'tree-diameter' : 'lowest-common-ancestor',
    maxSize: 32,
    inputHint:
      'Enter {"parents":[-1,0,0,1,1,2,2],"a":3,"b":4}. Parent indices precede their children.',
    presets: {
      best: { parents: [-1], a: 0, b: 0 },
      average: { parents: [-1, 0, 0, 1, 1, 2, 2], a: 3, b: 4 },
      worst: { parents: [-1, 0, 1, 2, 3, 4, 5, 6], a: 0, b: 7 },
      random: (n, s = 42) => {
        const a = randomNumbers(Math.min(n, 32), s),
          parents = a.map((v, i) => (i === 0 ? -1 : v % i));
        return { parents, a: 0, b: parents.length - 1 };
      },
    },
    validateInput: rooted,
    complexity: {
      best: diameter ? 'O(n)' : 'O(1) same node',
      average: diameter ? 'O(n)' : 'O(h)',
      worst: diameter ? 'O(n)' : 'O(h)',
      space: 'O(n) adjacency/depth data',
      why: diameter
        ? 'Two tree traversals find a farthest endpoint and then the farthest point from it. The unique-path, undirected tree assumption is essential.'
        : 'Align depths and move both nodes to their parents until equal. This single-query method does not claim the O(log n) bound of binary lifting.',
    },
    *generate({ parents, a, b }) {
      const c = counters(),
        adj = parents.map(() => [] as number[]),
        depth = parents.map(() => 0);
      for (let i = 1; i < parents.length; i++) {
        adj[i].push(parents[i]);
        adj[parents[i]].push(i);
        depth[i] = depth[parents[i]] + 1;
      }
      const nodes = parents.map((_, i) => ({
          id: String(i),
          label: String(i),
          x: 35 + 45 * i,
          y: 35 + depth[i] * 55,
        })),
        edges = parents.flatMap((p, i) =>
          i ? [{ from: String(p), to: String(i) }] : [],
        );
      const emit = (
        text: string,
        line: number,
        active: number,
        vars: Frame['variables'] = {},
        action?: Frame['action'],
      ) =>
        frame(
          { kind: 'tree', values: parents, nodes, edges, directed: false },
          text,
          c,
          line,
          vars,
          [{ id: String(active), kind: 'visited' }],
          action,
        );
      yield emit(
        'The parent array defines a connected acyclic rooted tree.',
        1,
        0,
      );
      let result: import('@/engine/types').JsonValue;
      if (diameter) {
        function* farthest(
          start: number,
        ): Generator<
          Frame,
          { node: number; distance: number; parent: number[] }
        > {
          const queue = [start],
            distance = parents.map(() => -1),
            parent = parents.map(() => -1);
          distance[start] = 0;
          let far = start;
          for (let head = 0; head < queue.length; head++) {
            const u = queue[head];
            if (distance[u] > distance[far]) far = u;
            c.reads++;
            yield emit(
              'Measure unique tree-path distance from this endpoint.',
              3,
              u,
              { start, distance: distance[u] },
            );
            for (const v of adj[u])
              if (distance[v] === -1) {
                distance[v] = distance[u] + 1;
                parent[v] = u;
                queue.push(v);
                c.writes++;
              }
          }
          return { node: far, distance: distance[far], parent };
        }
        const first = yield* farthest(0),
          last = yield* farthest(first.node),
          path: number[] = [];
        for (let at = last.node; at !== -1; at = last.parent[at]) path.push(at);
        result = { length: last.distance, path };
      } else {
        let u = a,
          v = b;
        while (depth[u] > depth[v]) {
          yield emit(
            'Raise the deeper node before moving both together.',
            3,
            u,
            { u, v },
          );
          u = parents[u];
          c.reads++;
        }
        while (depth[v] > depth[u]) {
          yield emit(
            'Raise the deeper node before moving both together.',
            3,
            v,
            { u, v },
          );
          v = parents[v];
          c.reads++;
        }
        while (u !== v) {
          c.comparisons++;
          yield emit(
            'At equal depth, raise both nodes one level.',
            5,
            u,
            { u, v },
            {
              prompt: 'Have both paths met?',
              choices: ['Keep climbing', 'Common ancestor found'],
              answer: 'Keep climbing',
              hint: 'The lowest shared node is found when both current node IDs are equal.',
            },
          );
          u = parents[u];
          v = parents[v];
          c.reads += 2;
        }
        result = u;
      }
      const f = emit(
        'The tree relation follows from its unique ancestor paths.',
        6,
        0,
      );
      f.state.result = result;
      yield f;
    },
  };
}
const btreeSchema = z.object({
  keys: z.array(z.number().int().min(-999).max(999)).min(1).max(32),
  query: z.number().int().min(-999).max(999),
  plus: z.boolean().default(false),
});
export const btree: Visualizer<z.infer<typeof btreeSchema>> = {
  id: 'b-tree-b-tree',
  maxSize: 32,
  inputHint:
    'Enter {"keys":[10,20,5,6,12,30,7,17],"query":12,"plus":false}. Toggle plus for a B+ tree with data keys only in linked leaves.',
  presets: {
    best: { keys: [1], query: 1, plus: false },
    average: { keys: [10, 20, 5, 6, 12, 30, 7, 17], query: 12, plus: false },
    worst: {
      keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      query: 13,
      plus: true,
    },
    random: (n, s) => ({
      keys: randomNumbers(Math.min(n, 32), s),
      query: 50,
      plus: true,
    }),
  },
  validateInput(raw) {
    return btreeSchema.parse(raw);
  },
  complexity: {
    best: 'O(1) root hit',
    average: 'O(log_b n) page visits',
    worst: 'O(log_b n) page visits',
    space: 'O(n) keys and page pointers',
    why: 'Multi-key pages increase branching factor. This bounded order-four model stores at most three separator keys per page, splits overflow pages, and searches one child per level. In B+ mode all data lives in linked leaves and internal keys are routing copies.',
  },
  *generate({ keys, query, plus }) {
    type Page = { id: number; keys: number[]; children: Page[] };
    let serial = 0;
    const page = (keys: number[] = [], children: Page[] = []): Page => ({
      id: serial++,
      keys,
      children,
    });
    let root = page();
    const c = counters();
    c.splits = 0;
    c.pageVisits = 0;
    function emit(
      text: string,
      line: number,
      active = -1,
      vars: Frame['variables'] = {},
      action?: Frame['action'],
    ) {
      const nodes: NonNullable<VisualState['nodes']> = [],
        edges: NonNullable<VisualState['edges']> = [],
        leaves: Page[] = [];
      let cursor = 0;
      function walk(p: Page, d: number): number {
        let x;
        if (!p.children.length) {
          x = 50 + cursor++ * 140;
          leaves.push(p);
        } else {
          x =
            p.children
              .map((child) => {
                edges.push({ from: String(p.id), to: String(child.id) });
                return walk(child, d + 1);
              })
              .reduce((a, b) => a + b, 0) / p.children.length;
        }
        nodes.push({
          id: String(p.id),
          label: p.keys.join('|') || '∅',
          x,
          y: 45 + d * 85,
        });
        return x;
      }
      walk(root, 0);
      if (plus)
        for (let i = 1; i < leaves.length; i++)
          edges.push({
            from: String(leaves[i - 1].id),
            to: String(leaves[i].id),
            label: 'next',
          });
      return frame(
        { kind: 'tree', values: [], nodes, edges },
        text,
        c,
        line,
        { plus, ...vars },
        active < 0 ? [] : [{ id: String(active), kind: 'comparing' }],
        action,
      );
    }
    yield emit('An order-four tree begins with one empty leaf page.', 1);
    function* insert(
      p: Page,
      key: number,
    ): Generator<Frame, { separator: number; right: Page } | null> {
      c.pageVisits++;
      let i = 0;
      while (i < p.keys.length) {
        c.comparisons++;
        if (key < p.keys[i] || (!plus && key === p.keys[i])) break;
        i++;
      }
      yield emit(
        'Choose a sorted slot or the next child page.',
        3,
        p.id,
        { key, slot: i },
        {
          prompt: 'Is this a leaf page?',
          choices: ['Store data here', 'Descend through child'],
          answer: p.children.length
            ? 'Descend through child'
            : 'Store data here',
          hint: 'A leaf has no child pages. B+ internal separators only route the search.',
        },
      );
      if (p.children.length) {
        const split = yield* insert(p.children[i], key);
        if (split) {
          p.keys.splice(i, 0, split.separator);
          p.children.splice(i + 1, 0, split.right);
          c.writes += 2;
        }
      } else {
        p.keys.splice(i, 0, key);
        c.writes++;
      }
      if (p.keys.length <= 3) return null;
      c.splits++;
      if (plus && !p.children.length) {
        const right = page(p.keys.splice(2));
        yield emit('Split a leaf, keeping all data keys in leaves.', 4, p.id, {
          separator: right.keys[0],
        });
        return { separator: right.keys[0], right };
      }
      const middle = 2,
        separator = p.keys[middle],
        right = page(
          p.keys.splice(middle + 1),
          p.children.length ? p.children.splice(middle + 1) : [],
        );
      p.keys.splice(middle, 1);
      yield emit('Promote the middle separator and split the page.', 4, p.id, {
        separator,
      });
      return { separator, right };
    }
    for (const key of [...new Set(keys)]) {
      const split = yield* insert(root, key);
      if (split) {
        root = page([split.separator], [root, split.right]);
        c.writes++;
      }
      yield emit(
        'Commit the insertion with every page inside its key capacity.',
        5,
        root.id,
        { key },
      );
    }
    let at = root,
      found = false;
    while (true) {
      c.pageVisits++;
      let i = 0;
      while (i < at.keys.length && query > at.keys[i]) {
        i++;
        c.comparisons++;
      }
      c.comparisons++;
      yield emit(
        'Search reads one page and selects its separator interval.',
        3,
        at.id,
        { query, slot: i },
      );
      if (!at.children.length) {
        found = at.keys.includes(query);
        break;
      }
      if (!plus && at.keys[i] === query) {
        found = true;
        break;
      }
      if (plus && at.keys[i] === query) i++;
      at = at.children[i];
    }
    function data(p: Page): number[] {
      if (plus)
        return p.children.length ? p.children.flatMap(data) : [...p.keys];
      const out: number[] = [];
      for (let i = 0; i < p.keys.length; i++) {
        if (p.children[i]) out.push(...data(p.children[i]));
        out.push(p.keys[i]);
      }
      if (p.children.at(-1)) out.push(...data(p.children.at(-1)!));
      return out;
    }
    const f = emit(
      found
        ? 'The queried data key exists.'
        : 'The selected leaf or separator interval excludes this key.',
      6,
      at.id,
      { found },
    );
    f.state.result = {
      found,
      keys: data(root),
      pages: root as unknown as import('@/engine/types').JsonValue,
    };
    yield f;
  },
};
