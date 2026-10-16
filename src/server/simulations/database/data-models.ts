import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const schema = z
  .object({
    model: z
      .enum(['relational', 'document', 'key-value', 'wide-column', 'graph'])
      .default('relational'),
    ownerIndex: z.boolean().default(true),
    rows: z
      .array(
        z.object({
          id: z.number().int().min(0).max(999),
          owner: z.number().int().min(0).max(15),
          created: z.number().int().min(0).max(999),
          amount: z.number().int().min(0).max(999),
        }),
      )
      .min(1)
      .max(32),
    friends: z
      .array(
        z.tuple([
          z.number().int().min(0).max(15),
          z.number().int().min(0).max(15),
        ]),
      )
      .max(32)
      .default([]),
    owner: z.number().int().min(0).max(15).default(0),
    depth: z.number().int().min(0).max(3).default(0),
    minCreated: z.number().int().min(0).max(999).default(0),
    maxCreated: z.number().int().min(0).max(999).default(999),
    minAmount: z.number().int().min(0).max(999).default(0),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (new Set(p.rows.map((r) => r.id)).size !== p.rows.length)
      ctx.addIssue({ code: 'custom', message: 'Record IDs must be unique.' });
    if (p.minCreated > p.maxCreated)
      ctx.addIssue({ code: 'custom', message: 'Time range must be ordered.' });
    if (
      p.friends.some(([a, b]) => a === b) ||
      new Set(p.friends.map(([a, b]) => `${a}:${b}`)).size !== p.friends.length
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Directed friendship edges must be distinct and non-self.',
      });
  });
type Input = z.infer<typeof schema>;
const example = Array.from({ length: 16 }, (_, id) => ({
  id,
  owner: id % 4,
  created: id,
  amount: id * 10,
}));
export function dataModels(slug = 'nosql-data-models'): Visualizer<Input> {
  return {
    id: slug,
    maxSize: 32,
    measureSize: (p) => p.rows.length,
    inputHint:
      'Compare explicit query implementations over the same order records: normalized row scan/index, embedded owner documents, key-value records plus optional manually maintained owner index, owner/time wide-column partitions, and graph adjacency plus owner records. Query selects the owner and directed friends up to depth, then a time/amount range. These are chosen teaching layouts, not universal capability/transaction guarantees of all SQL or NoSQL products.',
    controls: [
      {
        key: 'model',
        label: 'Data layout',
        type: 'select',
        options: [
          'relational',
          'document',
          'key-value',
          'wide-column',
          'graph',
        ].map((value) => ({ value, label: value })),
      },
      {
        key: 'ownerIndex',
        label: 'Maintain row/KV owner index',
        type: 'boolean',
      },
      {
        key: 'depth',
        label: 'Directed friend expansion depth',
        type: 'number',
        min: 0,
        max: 3,
      },
      {
        key: 'minCreated',
        label: 'Minimum created value',
        type: 'number',
        min: 0,
        max: 999,
      },
      {
        key: 'maxCreated',
        label: 'Maximum created value',
        type: 'number',
        min: 0,
        max: 999,
      },
    ],
    presets: {
      best: schema.parse({
        model: 'key-value',
        rows: [{ id: 0, owner: 0, created: 0, amount: 10 }],
      }),
      average: schema.parse({
        model: 'wide-column',
        rows: example,
        owner: 1,
        minCreated: 4,
        maxCreated: 12,
      }),
      worst: schema.parse({
        model: 'relational',
        ownerIndex: false,
        rows: example,
        friends: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0],
        ],
        depth: 3,
        minAmount: 100,
      }),
      random: (n) =>
        schema.parse({
          rows: Array.from(
            { length: Math.min(32, Math.max(1, n)) },
            (_, id) => ({ id, owner: id % 4, created: id, amount: id * 7 }),
          ),
        }),
    },
    validateInput: (raw) => schema.parse(raw),
    complexity: {
      best: 'Direct owner/document/key access visits only its selected records',
      average:
        'Wide-column time bounds use binary search; graph neighborhood uses BFS adjacency',
      worst:
        'Without a usable index, row/KV filtering scans all records; hot partitions still contain large candidate sets',
      space: 'O(records + owner references + graph edges)',
      why: 'Construction/index maintenance work is shown separately from query record visits. SQL can store JSON and traverse graphs; many NoSQL systems support transactions/indexes. Select a concrete product and workload rather than treating model names as guarantees.',
      metric: { label: 'Query record visits', keys: ['recordVisits'] },
    },
    *generate(p) {
      const c = counters();
      c.recordVisits = 0;
      c.edgeVisits = 0;
      c.rangeComparisons = 0;
      c.buildEntries = 0;
      c.pointLookups = 0;
      const byOwner = new Map<number, Input['rows']>(),
        kv = new Map<number, Input['rows'][number]>(),
        adj = new Map<number, number[]>();
      for (const row of p.rows) {
        const group = byOwner.get(row.owner) ?? [];
        group.push(row);
        byOwner.set(row.owner, group);
        kv.set(row.id, row);
        c.buildEntries++;
      }
      for (const group of byOwner.values())
        group.sort((a, b) => a.created - b.created || a.id - b.id);
      for (const [from, to] of p.friends) {
        const list = adj.get(from) ?? [];
        list.push(to);
        adj.set(from, list);
      }
      const scene: VisualState = {
        kind: 'architecture',
        values: [],
        nodes: [
          {
            id: 'query',
            label: 'Owner + neighborhood + time/amount',
            x: 0,
            y: 100,
          },
          { id: 'layout', label: `Layout: ${p.model}`, x: 270, y: 100 },
          {
            id: 'access',
            label:
              p.model === 'graph'
                ? 'Adjacency traversal'
                : p.model === 'wide-column'
                  ? 'Partition + clustering-time bounds'
                  : p.model === 'document'
                    ? 'Embedded owner documents'
                    : p.ownerIndex
                      ? 'Owner secondary references'
                      : 'All record scan',
            x: 530,
            y: 100,
          },
          {
            id: 'result',
            label: 'Filtered records, ordered by ID',
            x: 790,
            y: 100,
          },
        ],
        edges: [
          { from: 'query', to: 'layout' },
          { from: 'layout', to: 'access' },
          { from: 'access', to: 'result' },
        ],
      };
      yield frame(
        scene,
        'Model the query first, then identify which layout and indexes make that query local.',
        c,
        1,
        { model: p.model, records: p.rows.length },
      );
      const owners = new Set([p.owner]),
        queue = [{ owner: p.owner, depth: 0 }];
      let head = 0;
      while (head < queue.length) {
        const item = queue[head++];
        if (item.depth >= p.depth) continue;
        let neighbors: number[];
        if (p.model === 'graph') {
          neighbors = adj.get(item.owner) ?? [];
          c.edgeVisits += neighbors.length;
        } else {
          neighbors = [];
          for (const [from, to] of p.friends) {
            c.edgeVisits++;
            if (from === item.owner) neighbors.push(to);
          }
        }
        for (const neighbor of neighbors)
          if (!owners.has(neighbor)) {
            owners.add(neighbor);
            queue.push({ owner: neighbor, depth: item.depth + 1 });
          }
        yield frame(
          scene,
          'Deduplicate visited owners to bound a cyclic neighborhood expansion.',
          c,
          2,
          {
            owner: item.owner,
            depth: item.depth,
            owners: [...owners].join(','),
          },
          [{ id: 'access', kind: 'visited' }],
        );
      }
      let candidates: Input['rows'] = [];
      if (
        ['document', 'graph', 'wide-column'].includes(p.model) ||
        p.ownerIndex
      ) {
        for (const owner of owners) {
          c.pointLookups++;
          let records = byOwner.get(owner) ?? [];
          if (p.model === 'wide-column') {
            let lo = 0,
              hi = records.length;
            while (lo < hi) {
              const mid = (lo + hi) >>> 1;
              c.rangeComparisons++;
              if (records[mid].created < p.minCreated) lo = mid + 1;
              else hi = mid;
            }
            const start = lo;
            hi = records.length;
            while (lo < hi) {
              const mid = (lo + hi) >>> 1;
              c.rangeComparisons++;
              if (records[mid].created <= p.maxCreated) lo = mid + 1;
              else hi = mid;
            }
            records = records.slice(start, lo);
          }
          candidates.push(
            ...records.map((row) =>
              p.model === 'key-value' ? kv.get(row.id)! : row,
            ),
          );
        }
      } else candidates = p.rows;
      const output: Input['rows'] = [];
      for (const row of candidates) {
        c.recordVisits++;
        c.reads++;
        const matches =
          owners.has(row.owner) &&
          row.created >= p.minCreated &&
          row.created <= p.maxCreated &&
          row.amount >= p.minAmount;
        yield frame(
          scene,
          'Access locality narrows candidates; remaining predicates still have to be evaluated.',
          c,
          3,
          {
            record: row.id,
            owner: row.owner,
            created: row.created,
            amount: row.amount,
          },
          [{ id: 'access', kind: 'comparing' }],
          {
            prompt: 'Does this candidate satisfy the complete query?',
            choices: ['Include record', 'Filter out record'],
            answer: matches ? 'Include record' : 'Filter out record',
            hint: 'Check reachable ownership, inclusive time bounds and minimum amount.',
          },
        );
        if (matches) {
          output.push(row);
          c.writes++;
        }
      }
      output.sort((a, b) => a.id - b.id);
      yield frame(
        {
          ...scene,
          result: {
            model: p.model,
            owners: [...owners].sort((a, b) => a - b),
            output,
            recordVisits: c.recordVisits,
            edgeVisits: c.edgeVisits,
            rangeComparisons: c.rangeComparisons,
            indexBuildEntries: c.buildEntries,
            candidateRows: candidates.length,
            layoutAssumptions:
              'Read-only fixture with indexes built at initialization. Real write maintenance, distributed transactions, partition limits and product-specific query support are separate decisions.',
          },
        },
        'Compare results and access work under the same query. A data-model category alone does not determine consistency, schema validation or transaction scope.',
        c,
        6,
        { results: output.length },
      );
    },
  };
}
