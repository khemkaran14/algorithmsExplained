import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
import { hash32 } from '../ids-sharding';
const schema = z
  .object({
    memLimit: z.number().int().min(1).max(8).default(3),
    bloom: z.boolean().default(true),
    fullCompaction: z.boolean().default(false),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({
            kind: z.literal('put'),
            key: z.number().int().min(0).max(99),
            value: z.number().int().min(-999).max(999),
          }),
          z.object({
            kind: z.literal('delete'),
            key: z.number().int().min(0).max(99),
          }),
          z.object({
            kind: z.literal('get'),
            key: z.number().int().min(0).max(99),
          }),
          z.object({ kind: z.literal('flush') }),
          z.object({ kind: z.literal('compact') }),
        ]),
      )
      .min(1)
      .max(32),
  })
  .strict();
export const lsm: Visualizer<z.infer<typeof schema>> = {
  id: 'lsm-trees-sstables',
  maxSize: 32,
  measureSize: (p) => p.operations.length,
  inputHint:
    'A sorted memtable flushes immutable sorted runs. Reads check memory then newest runs and stop at the newest value or tombstone. A real 64-bit, two-hash Bloom filter may skip impossible keys but can have false positives. Partial compaction merges the oldest two runs and retains tombstones; full compaction covers every run and may drop tombstones. No WAL, level-size policy or real disk is modeled.',
  controls: [
    {
      key: 'memLimit',
      label: 'Distinct memtable keys before flush',
      type: 'number',
      min: 1,
      max: 8,
    },
    { key: 'bloom', label: 'Bloom-filter table probes', type: 'boolean' },
    {
      key: 'fullCompaction',
      label: 'Compact every run (safe tombstone purge)',
      type: 'boolean',
    },
  ],
  presets: {
    best: schema.parse({
      operations: [
        { kind: 'put', key: 1, value: 10 },
        { kind: 'get', key: 1 },
      ],
    }),
    average: schema.parse({
      memLimit: 2,
      operations: [
        { kind: 'put', key: 1, value: 10 },
        { kind: 'put', key: 2, value: 20 },
        { kind: 'put', key: 1, value: 30 },
        { kind: 'delete', key: 2 },
        { kind: 'get', key: 2 },
        { kind: 'get', key: 1 },
        { kind: 'compact' },
        { kind: 'get', key: 1 },
      ],
    }),
    worst: schema.parse({
      memLimit: 1,
      bloom: false,
      operations: [
        { kind: 'put', key: 1, value: 1 },
        { kind: 'put', key: 1, value: 2 },
        { kind: 'delete', key: 1 },
        { kind: 'get', key: 1 },
        { kind: 'get', key: 99 },
        { kind: 'compact' },
        { kind: 'get', key: 1 },
      ],
    }),
    random: (n) =>
      schema.parse({
        operations: [
          ...Array.from({ length: Math.min(28, Math.max(1, n)) }, (_, i) => ({
            kind: 'put',
            key: i % 8,
            value: i,
          })),
          { kind: 'flush' },
          { kind: 'get', key: 3 },
          { kind: 'compact' },
        ],
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'O(1) indexed memtable hit in this teaching representation',
    average:
      'Read O(R log M) across R immutable sorted runs of at most M entries',
    worst:
      'Repeated flush/compaction rewrites entries and raises write amplification',
    space: 'O(memtable + run entries + Bloom bits)',
    why: 'Flush and this simple compaction sort their input (O(M log M)); production merges can stream sorted iterators. Bloom filters reduce unnecessary negative probes but never establish that a key definitely exists.',
    metric: { label: 'SSTable probes', keys: ['tableProbes'] },
  },
  *generate(p) {
    type Entry = { key: number; value: number | null; sequence: number };
    type Run = { id: number; entries: Entry[]; bits: Set<number> };
    let sequence = 0,
      serial = 0;
    const mem = new Map<number, Entry>(),
      runs: Run[] = [],
      reads: {
        key: number;
        value: number | null;
        source: string;
        deleted: boolean;
      }[] = [],
      c = counters();
    c.tableProbes = 0;
    c.bloomChecks = 0;
    c.bloomSkips = 0;
    c.entriesWritten = 0;
    c.compactions = 0;
    c.flushes = 0;
    c.tombstonesDropped = 0;
    const bits = (key: number) => [
      hash32(`a:${key}`) % 64,
      hash32(`b:${key}`) % 64,
    ];
    function make(entries: Entry[]): Run {
      const sorted = [...entries].sort((a, b) => a.key - b.key),
        filter = new Set<number>();
      for (const e of sorted) for (const bit of bits(e.key)) filter.add(bit);
      c.entriesWritten += entries.length;
      c.writes += entries.length;
      return { id: serial++, entries: sorted, bits: filter };
    }
    function flush() {
      if (!mem.size) return;
      runs.unshift(make([...mem.values()]));
      mem.clear();
      c.flushes++;
    }
    function scene(): VisualState {
      return {
        kind: 'architecture',
        values: [],
        nodes: [
          {
            id: 'mem',
            label: `Memtable: ${[...mem.keys()].sort((a, b) => a - b).join(',') || 'empty'}`,
            x: 0,
            y: 60,
          },
          ...runs.map((run, i) => ({
            id: `run${run.id}`,
            label: `SST ${run.id}: ${run.entries.map((e) => `${e.key}${e.value === null ? '†' : ''}`).join(',')}`,
            x: 250,
            y: i * 100,
          })),
        ],
        edges: runs.map((run) => ({
          from: 'mem',
          to: `run${run.id}`,
          label: 'newest-first probe',
        })),
      };
    }
    yield frame(
      scene(),
      'Immutable sorted tables avoid in-place data-page updates, while compaction and version retention create their own costs.',
      c,
      1,
    );
    for (const op of p.operations) {
      if (op.kind === 'put' || op.kind === 'delete') {
        const entry = {
          key: op.key,
          value: op.kind === 'delete' ? null : op.value,
          sequence: ++sequence,
        };
        mem.set(op.key, entry);
        c.writes++;
        if (mem.size >= p.memLimit) flush();
      } else if (op.kind === 'flush') flush();
      else if (op.kind === 'compact') {
        if (runs.length >= 2) {
          const count = p.fullCompaction ? runs.length : 2,
            start = runs.length - count,
            selected = runs.splice(start, count),
            merged = new Map<number, Entry>();
          for (const run of selected)
            for (const entry of run.entries) {
              c.reads++;
              const previous = merged.get(entry.key);
              if (!previous || entry.sequence > previous.sequence)
                merged.set(entry.key, entry);
            }
          let entries = [...merged.values()];
          if (p.fullCompaction) {
            c.tombstonesDropped += entries.filter(
              (e) => e.value === null,
            ).length;
            entries = entries.filter((e) => e.value !== null);
          }
          if (entries.length) runs.splice(start, 0, make(entries));
          c.compactions++;
        }
      } else {
        let entry = mem.get(op.key),
          source = entry ? 'memtable' : 'missing';
        c.reads++;
        if (!entry)
          for (const run of runs) {
            const possible =
              !p.bloom || bits(op.key).every((bit) => run.bits.has(bit));
            if (p.bloom) c.bloomChecks++;
            yield frame(
              scene(),
              'A Bloom negative can skip this table; a positive only permits a lookup.',
              c,
              3,
              { key: op.key, table: run.id, bloomPositive: possible },
              [{ id: `run${run.id}`, kind: 'comparing' }],
              {
                prompt: 'What happens next to this SSTable?',
                choices: [
                  'Skip a definitely absent key',
                  'Probe the sorted table',
                ],
                answer: possible
                  ? 'Probe the sorted table'
                  : 'Skip a definitely absent key',
                hint: 'Bloom false positives are possible, but a correctly built filter never rejects a key actually stored here.',
              },
            );
            if (!possible) {
              c.bloomSkips++;
              continue;
            }
            c.tableProbes++;
            let lo = 0,
              hi = run.entries.length;
            while (lo < hi) {
              const mid = (lo + hi) >>> 1;
              c.comparisons++;
              if (run.entries[mid].key < op.key) lo = mid + 1;
              else hi = mid;
            }
            if (run.entries[lo]?.key === op.key) {
              entry = run.entries[lo];
              source = `SST ${run.id}`;
              break;
            }
          }
        reads.push({
          key: op.key,
          value: entry?.value ?? null,
          source,
          deleted: entry?.value === null,
        });
      }
      yield frame(
        scene(),
        'A tombstone stops older values from reappearing; partial compaction cannot discard that protection.',
        c,
        5,
        { memtable: mem.size, runs: runs.length, lastOperation: op.kind },
      );
    }
    yield frame(
      {
        ...scene(),
        result: {
          memtable: [...mem.values()].sort((a, b) => a.key - b.key),
          runs: runs.map(({ id, entries }) => ({ id, entries })),
          reads,
          flushes: c.flushes,
          compactions: c.compactions,
          entriesWritten: c.entriesWritten,
          tableProbes: c.tableProbes,
          bloomSkips: c.bloomSkips,
          tombstonesDropped: c.tombstonesDropped,
        },
      },
      'Flush and compaction trade write amplification for bounded read work. The memtable is volatile without a separate WAL/recovery protocol.',
      c,
      6,
    );
  },
};
