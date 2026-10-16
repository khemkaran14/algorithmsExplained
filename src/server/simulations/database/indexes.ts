import 'server-only';
import { btree } from '../../visualizers/trees';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const column = z.enum(['tenant', 'status', 'created', 'amount']);
const schema = z
  .object({
    rows: z
      .array(
        z.object({
          id: z.number().int().min(0).max(999),
          tenant: z.number().int().min(0).max(9),
          status: z.number().int().min(0).max(3),
          created: z.number().int().min(0).max(999),
          amount: z.number().int().min(0).max(999),
        }),
      )
      .min(1)
      .max(64),
    indexColumns: z.array(column).min(1).max(4),
    predicates: z
      .array(z.object({ column, value: z.number().int().min(0).max(999) }))
      .max(4),
    projection: z.array(column).min(1).max(4),
    plan: z.enum(['auto', 'sequential', 'index']).default('auto'),
    estimatedPercent: z.number().min(0).max(100).default(10),
  })
  .strict()
  .superRefine((p, ctx) => {
    for (const list of [
      p.rows.map((r) => r.id),
      p.indexColumns,
      p.projection,
      p.predicates.map((f) => f.column),
    ])
      if (new Set<string | number>(list).size !== list.length)
        ctx.addIssue({
          code: 'custom',
          message:
            'IDs, index/projection columns and predicate columns must be distinct.',
        });
  });
type Input = z.infer<typeof schema>;
const rows = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  tenant: i % 4,
  status: i % 2,
  created: i,
  amount: i * 10,
}));
export function databaseIndex(
  slug = 'composite-covering-indexes',
): Visualizer<Input> {
  return {
    id: slug,
    maxSize: 64,
    measureSize: (p) => p.rows.length,
    inputHint:
      'Integer example rows with a sorted composite index. Equality on the leftmost consecutive index columns supports a seek; a non-leading predicate alone requires a scan in this baseline. Projection plus predicates must be covered to avoid modeled heap fetches. Costs are illustrative page/work units, not PostgreSQL EXPLAIN estimates or latency. Leaf pages hold four entries; no skip scan, MVCC visibility map or real disk is modeled.',
    controls: [
      {
        key: 'plan',
        label: 'Access plan',
        type: 'select',
        options: ['auto', 'sequential', 'index'].map((value) => ({
          value,
          label: value,
        })),
      },
      {
        key: 'estimatedPercent',
        label: 'Estimated candidate selectivity percent',
        type: 'number',
        min: 0,
        max: 100,
      },
    ],
    presets: {
      best: schema.parse({
        rows,
        indexColumns: ['tenant', 'created'],
        predicates: [{ column: 'tenant', value: 1 }],
        projection: ['tenant', 'created'],
      }),
      average: schema.parse({
        rows,
        indexColumns: ['tenant', 'created'],
        predicates: [{ column: 'tenant', value: 1 }],
        projection: ['tenant', 'amount'],
      }),
      worst: schema.parse({
        rows,
        indexColumns: ['tenant', 'created'],
        predicates: [{ column: 'created', value: 7 }],
        projection: ['amount'],
        plan: 'index',
      }),
      random: (n) =>
        schema.parse({
          rows: Array.from(
            { length: Math.min(64, Math.max(1, n)) },
            (_, i) => ({
              id: i,
              tenant: i % 4,
              status: i % 2,
              created: i,
              amount: (i * 7) % 999,
            }),
          ),
          indexColumns: ['tenant', 'created'],
          predicates: [{ column: 'tenant', value: 1 }],
          projection: ['tenant', 'created'],
        }),
    },
    validateInput: (raw) => schema.parse(raw),
    complexity: {
      best: 'Index range location O(log N + K), then K candidate tests',
      average:
        'O(N log N) teaching index build; actual queries depend on prefix selectivity and coverage',
      worst: 'O(N) leaf/heap scan when no useful leftmost prefix exists',
      space: 'O(N) index entries plus output rows',
      why: 'The simulator constructs the index for illustration; production indexes are persistent. Modeled page costs omit buffer caches, MVCC visibility checks, correlation and planner features.',
      metric: { label: 'Predicate evaluations', keys: ['predicates'] },
    },
    *generate(p) {
      const c = counters();
      c.predicates = 0;
      c.indexComparisons = 0;
      c.heapFetches = 0;
      c.leafPages = 0;
      c.heapPages = 0;
      const sorted = [...p.rows].sort((a, b) => {
          for (const col of p.indexColumns) {
            c.indexComparisons++;
            if (a[col] !== b[col]) return a[col] - b[col];
          }
          return a.id - b.id;
        }),
        filters = new Map(p.predicates.map((f) => [f.column, f.value])),
        prefix = p.indexColumns.slice(
          0,
          p.indexColumns.findIndex((col) => !filters.has(col)) < 0
            ? p.indexColumns.length
            : p.indexColumns.findIndex((col) => !filters.has(col)),
        ),
        covered = [...p.projection, ...p.predicates.map((f) => f.column)].every(
          (col) => p.indexColumns.includes(col),
        );
      const leaves = Array.from(
        { length: Math.ceil(sorted.length / 4) },
        (_, i) => sorted.slice(i * 4, i * 4 + 4),
      );
      const scene: VisualState = {
        kind: 'architecture',
        values: [],
        nodes: [
          {
            id: 'root',
            label: `Composite index (${p.indexColumns.join(', ')})`,
            x: 0,
            y: 100,
          },
          ...leaves.map((page, i) => ({
            id: `leaf${i}`,
            label: `Leaf ${i}: row IDs ${page.map((r) => r.id).join(',')}`,
            x: 240,
            y: i * 90,
          })),
          { id: 'heap', label: 'Heap: full records', x: 520, y: 100 },
        ],
        edges: [
          ...leaves.map((_, i) => ({ from: 'root', to: `leaf${i}` })),
          ...leaves.slice(0, -1).map((_, i) => ({
            from: `leaf${i}`,
            to: `leaf${i + 1}`,
            label: 'next leaf',
          })),
        ],
      };
      yield frame(
        scene,
        'Sort composite keys lexicographically and group leaf entries into illustrative pages. The root summarizes pages; this is not a full B+ insertion implementation.',
        c,
        1,
        { leftmostPrefix: prefix.join(','), covered },
      );
      const compare = (row: Input['rows'][number]) => {
        for (const col of prefix) {
          c.indexComparisons++;
          if (row[col] !== filters.get(col)!)
            return row[col] - filters.get(col)!;
        }
        return 0;
      };
      let lo = 0,
        hi = sorted.length;
      if (prefix.length) {
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(sorted[mid]) < 0) lo = mid + 1;
          else hi = mid;
        }
      }
      const start = lo;
      hi = sorted.length;
      if (prefix.length) {
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(sorted[mid]) <= 0) lo = mid + 1;
          else hi = mid;
        }
      } else lo = sorted.length;
      const end = lo,
        estimatedCandidates = prefix.length
          ? (p.rows.length * p.estimatedPercent) / 100
          : p.rows.length,
        seekCost = prefix.length ? Math.ceil(Math.log2(leaves.length + 1)) : 0,
        estimatedIndex =
          seekCost +
          Math.ceil(estimatedCandidates / 4) +
          (covered ? 0 : estimatedCandidates * 2),
        estimatedSequential = Math.ceil(p.rows.length / 4),
        chosen =
          p.plan === 'auto'
            ? estimatedIndex < estimatedSequential
              ? 'index'
              : 'sequential'
            : p.plan;
      yield frame(
        scene,
        'A useful equality seek needs a leftmost prefix; coverage is a separate test over predicates and projected columns.',
        c,
        2,
        {
          prefix: prefix.join(','),
          covered,
          estimatedIndex,
          estimatedSequential,
          chosen,
        },
        [],
        {
          prompt: 'Can this query avoid heap fetches with the displayed index?',
          choices: [
            'Yes, all required columns are covered',
            'No, fetch non-indexed columns',
          ],
          answer: covered
            ? 'Yes, all required columns are covered'
            : 'No, fetch non-indexed columns',
          hint: 'Include every projected and filtered column when checking index coverage. Real engines may still need MVCC visibility checks.',
        },
      );
      const candidates = chosen === 'index' ? sorted.slice(start, end) : p.rows,
        output: Record<string, number>[] = [],
        pages = new Set<number>();
      for (let i = 0; i < candidates.length; i++) {
        const row = candidates[i];
        if (chosen === 'index') {
          pages.add(Math.floor((start + i) / 4));
          if (!covered) c.heapFetches++;
        } else c.heapPages = Math.ceil((i + 1) / 4);
        let match = true;
        for (const f of p.predicates) {
          c.predicates++;
          c.reads++;
          if (row[f.column] !== f.value) {
            match = false;
            break;
          }
        }
        if (match) {
          output.push(
            Object.fromEntries(p.projection.map((col) => [col, row[col]])),
          );
          c.writes++;
        }
        yield frame(
          scene,
          'Evaluate the remaining predicates on each candidate and project matching rows.',
          c,
          4,
          { row: row.id, matches: match, visited: i + 1 },
          [
            {
              id:
                chosen === 'index'
                  ? `leaf${Math.floor((start + i) / 4)}`
                  : 'heap',
              kind: match ? 'visited' : 'comparing',
            },
          ],
        );
      }
      c.leafPages = pages.size;
      yield frame(
        {
          ...scene,
          result: {
            plan: chosen,
            leftmostPrefix: prefix,
            covered,
            indexRange: [start, end],
            candidateRows: candidates.length,
            output,
            estimatedCosts: {
              index: estimatedIndex,
              sequential: estimatedSequential,
            },
            actualModeledCost:
              chosen === 'index'
                ? seekCost + c.leafPages + c.heapFetches * 2
                : c.heapPages,
            heapFetches: c.heapFetches,
            leafPages: c.leafPages,
            heapPages: c.heapPages,
            assumptions:
              '4 entries/page; seek in abstract page/work units, random heap fetch=2; no real EXPLAIN, visibility map or disk timing.',
          },
        },
        'Bad selectivity estimates can select a more expensive plan. SQL result ordering still requires ORDER BY; an access path alone is not a contract.',
        c,
        6,
        { outputRows: output.length },
      );
    },
  };
}

/** Reuse the tested order-four page engine with B+ semantics as the database default. */
export const bplusIndex: typeof import('../../visualizers/trees').btree = {
  ...btree,
  id: 'indexes-b-tree-lookups',
  measureSize: (input) => input.keys.length,
  controls: [
    { key: 'plus', label: 'Data only in linked B+ leaves', type: 'boolean' },
  ],
  presets: {
    ...btree.presets,
    best: { ...btree.presets.best, plus: true },
    average: { ...btree.presets.average, plus: true },
  },
  validateInput(raw) {
    return btree.validateInput(
      raw && typeof raw === 'object' && !Array.isArray(raw)
        ? { plus: true, ...raw }
        : raw,
    );
  },
};
