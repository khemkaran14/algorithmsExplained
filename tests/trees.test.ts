import { it, expect, describe } from 'vitest';
import {
  searchTree,
  traversals,
  heapVisualizer,
  trie,
  rangeTree,
  treeRelation,
  btree,
} from '@/server/visualizers/trees';
import type { Visualizer } from '@/engine/types';
const visualizers = [
  searchTree('bst'),
  searchTree('avl'),
  searchTree('red-black'),
  traversals,
  heapVisualizer(),
  heapVisualizer(true),
  trie,
  rangeTree(),
  rangeTree(true),
  treeRelation(),
  treeRelation(true),
  btree,
] as Visualizer<unknown>[];
describe.each(visualizers)('$id', (v) => {
  it('has deterministic immutable serializable preset traces', () => {
    for (const raw of [
      v.presets.best,
      v.presets.average,
      v.presets.worst,
      v.presets.random(8, 42),
    ]) {
      const input = v.validateInput(raw),
        copy = structuredClone(input),
        frames = [...v.generate(input)];
      expect(frames.length).toBeGreaterThan(1);
      expect(frames).toEqual([...v.generate(input)]);
      expect(input).toEqual(copy);
      expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
    }
  });
});
type N = {
  key: number;
  left: N | null;
  right: N | null;
  height: number;
  red: boolean;
};
function check(n: N | null, min = -Infinity, max = Infinity): number {
  if (!n) return 0;
  expect(n.key).toBeGreaterThan(min);
  expect(n.key).toBeLessThan(max);
  const l = check(n.left, min, n.key),
    r = check(n.right, n.key, max);
  expect(n.height).toBe(1 + Math.max(l, r));
  return n.height;
}
it('BST search/delete preserves ordering and removes exactly one set key', () => {
  for (const input of [
    [5],
    [4, 2, 6, 1, 3, 5, 7],
    [1, 2, 3, 4, 5],
    [5, 5, 5],
  ]) {
    const f = [...searchTree('bst').generate(input)].at(-1)!,
      r = f.state.result as { keys: number[]; root: N | null };
    expect(r.keys).toEqual(
      [...new Set(input)]
        .filter((v) => v !== input[Math.floor(input.length / 2)])
        .sort((a, b) => a - b),
    );
    check(r.root);
  }
});
it.each(['avl', 'red-black'] as const)(
  '%s preserves balance across sorted, reversed and duplicate-heavy insertions',
  (mode) => {
    for (const input of [
      Array.from({ length: 32 }, (_, i) => i),
      Array.from({ length: 32 }, (_, i) => 32 - i),
      [4, 1, 6, 2, 5, 3, 2, 1, 4],
    ]) {
      const frames = [...searchTree(mode).generate(input)],
        result = frames.at(-1)!.state.result as { keys: number[]; root: N };
      expect(result.keys).toEqual([...new Set(input)].sort((a, b) => a - b));
      check(result.root);
      function balanced(n: N | null): number {
        if (!n) return 1;
        if (mode === 'avl')
          expect(
            Math.abs((n.left?.height ?? 0) - (n.right?.height ?? 0)),
          ).toBeLessThanOrEqual(1);
        if (mode === 'red-black' && n.red) {
          expect(n.left?.red ?? false).toBe(false);
          expect(n.right?.red ?? false).toBe(false);
        }
        const left = balanced(n.left),
          right = balanced(n.right);
        if (mode === 'red-black') expect(left).toBe(right);
        return left + (n.red ? 0 : 1);
      }
      balanced(result.root);
      if (mode === 'red-black') expect(result.root.red).toBe(false);
    }
  },
);
it.each([
  ['pre', [4, 2, 1, 3, 6, 5, 7]],
  ['in', [1, 2, 3, 4, 5, 6, 7]],
  ['post', [1, 3, 2, 5, 7, 6, 4]],
  ['level', [4, 2, 6, 1, 3, 5, 7]],
] as const)('%s traversal visits the expected sequence', (order, output) => {
  expect(
    [...traversals.generate({ values: [4, 2, 6, 1, 3, 5, 7], order })].at(-1)!
      .state.result,
  ).toEqual(output);
});
it('heap extraction sorts descending and bottom-up heapify preserves the multiset', () => {
  for (const input of [[1], [4, 1, 6, 2, 5, 3], [2, 2, -1, 9, 0]]) {
    expect([...heapVisualizer().generate(input)].at(-1)!.state.result).toEqual(
      [...input].sort((a, b) => b - a),
    );
    const result = [...heapVisualizer(true).generate(input)].at(-1)!.state
      .result as number[];
    expect([...result].sort()).toEqual([...input].sort());
    for (let i = 1; i < result.length; i++)
      expect(result[Math.floor((i - 1) / 2)]).toBeGreaterThanOrEqual(result[i]);
  }
});
it('trie distinguishes a prefix from a terminal word', () => {
  for (const [query, prefix, found] of [
    ['ca', true, true],
    ['ca', false, false],
    ['cat', false, true],
    ['can', true, false],
  ] as const)
    expect(
      [...trie.generate({ words: ['cat', 'car'], query, prefix })].at(-1)!.state
        .result,
    ).toBe(found);
});
it.each([false, true])(
  'range sum index with Fenwick=%s matches updated naive sums',
  (fenwick) => {
    for (let n = 1; n <= 20; n++) {
      const values = Array.from({ length: n }, (_, i) => i - 4);
      for (let left = 0; left <= n; left++) {
        const right = n,
          index = Math.floor(n / 2),
          delta = -3,
          result = [
            ...rangeTree(fenwick).generate({
              values,
              left,
              right,
              update: { index, delta },
            }),
          ].at(-1)!.state.result as { sum: number; values: number[] };
        const expected = [...values];
        expected[index] += delta;
        expect(result.sum).toBe(
          expected.slice(left, right).reduce((a, b) => a + b, 0),
        );
        expect(result.values).toEqual(expected);
      }
    }
  },
);
it('parent-pointer LCA handles siblings, ancestors and identical nodes', () => {
  for (const [a, b, want] of [
    [3, 4, 1],
    [3, 6, 0],
    [1, 4, 1],
    [0, 0, 0],
  ])
    expect(
      [
        ...treeRelation().generate({ parents: [-1, 0, 0, 1, 1, 2, 2], a, b }),
      ].at(-1)!.state.result,
    ).toBe(want);
});
it('tree diameter counts edges and returns a valid longest path', () => {
  const f = [
    ...treeRelation(true).generate({
      parents: [-1, 0, 0, 1, 1, 2, 2],
      a: 0,
      b: 0,
    }),
  ].at(-1)!.state.result as { length: number; path: number[] };
  expect(f.length).toBe(4);
  expect(f.path).toHaveLength(5);
  expect(
    [...treeRelation(true).generate({ parents: [-1], a: 0, b: 0 })].at(-1)!
      .state.result,
  ).toEqual({ length: 0, path: [0] });
});
it.each([false, true])(
  'B-tree plus=%s preserves sorted data and page invariants across splits',
  (plus) => {
    type Page = { keys: number[]; children: Page[] };
    for (const keys of [
      Array.from({ length: 32 }, (_, i) => i),
      Array.from({ length: 32 }, (_, i) => 31 - i),
      [10, 20, 5, 6, 12, 30, 7, 17, 7],
    ]) {
      for (const query of [-1, keys[0], keys.at(-1)!, 99]) {
        const r = [...btree.generate({ keys, query, plus })].at(-1)!.state
          .result as { found: boolean; keys: number[]; pages: Page };
        expect(r.found).toBe(keys.includes(query));
        expect(r.keys).toEqual([...new Set(keys)].sort((a, b) => a - b));
        const depths: number[] = [];
        function check(p: Page, d = 0) {
          expect(p.keys.length).toBeLessThanOrEqual(3);
          expect(p.keys).toEqual([...p.keys].sort((a, b) => a - b));
          if (p.children.length) {
            expect(p.children.length).toBe(p.keys.length + 1);
            for (const child of p.children) check(child, d + 1);
          } else depths.push(d);
        }
        check(r.pages);
        expect(new Set(depths).size).toBe(1);
      }
    }
  },
);
it('rejects invalid parents and range indices', () => {
  expect(() =>
    treeRelation().validateInput({ parents: [-1, 1], a: 0, b: 1 }),
  ).toThrow();
  expect(() =>
    rangeTree().validateInput({
      values: [1],
      left: 0,
      right: 2,
      update: { index: 0, delta: 1 },
    }),
  ).toThrow();
});
