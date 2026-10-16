import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const key = z.enum(['x', 'y']),
  tx = z.enum(['A', 'B']);
const schema = z
  .object({
    isolation: z
      .enum([
        'read-uncommitted',
        'read-committed',
        'repeatable-read',
        'serializable',
      ])
      .default('repeatable-read'),
    initial: z
      .object({
        x: z.number().int().min(-999).max(999),
        y: z.number().int().min(-999).max(999),
      })
      .default({ x: 1, y: 1 }),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({ kind: z.literal('begin'), tx }),
          z.object({ kind: z.literal('read'), tx, key }),
          z.object({
            kind: z.literal('write'),
            tx,
            key,
            value: z.number().int().min(-999).max(999),
          }),
          z.object({ kind: z.literal('commit'), tx }),
          z.object({ kind: z.literal('rollback'), tx }),
        ]),
      )
      .min(1)
      .max(32),
  })
  .strict();
type Input = z.infer<typeof schema>;
const skew: Input['operations'] = [
  { kind: 'begin', tx: 'A' },
  { kind: 'begin', tx: 'B' },
  { kind: 'read', tx: 'A', key: 'x' },
  { kind: 'read', tx: 'A', key: 'y' },
  { kind: 'read', tx: 'B', key: 'x' },
  { kind: 'read', tx: 'B', key: 'y' },
  { kind: 'write', tx: 'A', key: 'x', value: 0 },
  { kind: 'write', tx: 'B', key: 'y', value: 0 },
  { kind: 'commit', tx: 'A' },
  { kind: 'commit', tx: 'B' },
];
export function transactions(
  slug = 'isolation-levels-anomalies',
): Visualizer<Input> {
  return {
    id: slug,
    maxSize: 32,
    measureSize: (p) => p.operations.length,
    inputHint:
      'Two transactions read/write integer keys x,y. Writes stay private until atomic commit; reads see own writes. Read committed uses current committed versions; repeatable read uses a snapshot acquired at its first read/write and aborts conflicting concurrent writes. PostgreSQL treats READ UNCOMMITTED as READ COMMITTED. Serializable uses an explicit serialization-graph cycle check, not PostgreSQL SSI internals. All writes are absolute client-computed values, not SQL UPDATE arithmetic; no predicate/phantom queries or physical locks are modeled.',
    controls: [
      {
        key: 'isolation',
        label: 'Isolation policy',
        type: 'select',
        options: [
          'read-uncommitted',
          'read-committed',
          'repeatable-read',
          'serializable',
        ].map((value) => ({ value, label: value })),
      },
    ],
    presets: {
      best: schema.parse({
        operations: [
          { kind: 'begin', tx: 'A' },
          { kind: 'write', tx: 'A', key: 'x', value: 7 },
          { kind: 'commit', tx: 'A' },
          { kind: 'begin', tx: 'B' },
          { kind: 'read', tx: 'B', key: 'x' },
          { kind: 'commit', tx: 'B' },
        ],
      }),
      average: schema.parse({ operations: skew }),
      worst: schema.parse({
        isolation: 'read-committed',
        operations: [
          { kind: 'begin', tx: 'A' },
          { kind: 'read', tx: 'A', key: 'x' },
          { kind: 'begin', tx: 'B' },
          { kind: 'write', tx: 'B', key: 'x', value: 5 },
          { kind: 'commit', tx: 'B' },
          { kind: 'read', tx: 'A', key: 'x' },
          { kind: 'commit', tx: 'A' },
        ],
      }),
      random: (n) =>
        schema.parse({
          operations: skew.slice(0, Math.min(skew.length, Math.max(1, n))),
        }),
    },
    validateInput: (raw) => schema.parse(raw),
    complexity: {
      best: 'Indexed visible-version lookup depends on version-chain size',
      average: 'O(operations × retained versions) with simple chain scans',
      worst:
        'Explicit serialization graph construction examines conflicting read/write histories',
      space: 'O(versions + buffered writes + read history)',
      why: 'A deliberately small version-history model. Real MVCC additionally requires vacuum, visibility rules, tuple metadata, locks and crash recovery; serializability includes predicate dependencies omitted here.',
      metric: { label: 'Version visibility checks', keys: ['versionChecks'] },
    },
    *generate(p) {
      type Tx = z.infer<typeof tx>;
      type Key = z.infer<typeof key>;
      type Version = { value: number; version: number; writer: Tx | null };
      type Transaction = {
        start: number;
        end: number | null;
        snapshot: number | null;
        state: string;
        writes: Map<Key, number>;
        reads: {
          key: Key;
          version: number;
          writer: Tx | null;
          value: number;
        }[];
      };
      const versions: Record<Key, Version[]> = {
          x: [{ value: p.initial.x, version: 0, writer: null }],
          y: [{ value: p.initial.y, version: 0, writer: null }],
        },
        active = new Map<Tx, Transaction>(),
        history: {
          operation: number;
          tx: string;
          kind: string;
          status: string;
          key: string | null;
          value: number | null;
        }[] = [],
        c = counters();
      let clock = 0;
      c.versionChecks = 0;
      c.commits = 0;
      c.aborts = 0;
      const snapshotMode = ['repeatable-read', 'serializable'].includes(
        p.isolation,
      );
      const scene: VisualState = {
        kind: 'architecture',
        values: [],
        nodes: [
          { id: 'A', label: 'Transaction A: private writes', x: 0, y: 0 },
          { id: 'B', label: 'Transaction B: private writes', x: 0, y: 160 },
          {
            id: 'versions',
            label: 'Committed MVCC version chains',
            x: 270,
            y: 80,
          },
          {
            id: 'check',
            label: 'Atomic commit / conflict check',
            x: 540,
            y: 80,
          },
        ],
        edges: [
          { from: 'A', to: 'versions' },
          { from: 'B', to: 'versions' },
          { from: 'A', to: 'check' },
          { from: 'B', to: 'check' },
          { from: 'check', to: 'versions' },
        ],
      };
      function serializationCycle(candidate: Tx) {
        const nodes = [...active].filter(
            ([id, t]) => t.state === 'committed' || id === candidate,
          ),
          edges = new Set<string>(),
          candidateVersion = clock + 1;
        for (const [reader, t] of nodes)
          for (const read of t.reads) {
            if (
              read.writer &&
              read.writer !== reader &&
              nodes.some(([id]) => id === read.writer)
            )
              edges.add(`${read.writer}:${reader}`);
            for (const [writer, w] of nodes) {
              if (writer === reader || !w.writes.has(read.key)) continue;
              const writeVersion =
                writer === candidate
                  ? candidateVersion
                  : versions[read.key].find((v) => v.writer === writer)
                      ?.version;
              if (writeVersion !== undefined && writeVersion > read.version)
                edges.add(`${reader}:${writer}`);
            }
          }
        for (const k of ['x', 'y'] as Key[]) {
          const writers = nodes
            .filter(([, t]) => t.writes.has(k))
            .sort(
              ([a], [b]) =>
                (a === candidate
                  ? candidateVersion
                  : versions[k].find((v) => v.writer === a)!.version) -
                (b === candidate
                  ? candidateVersion
                  : versions[k].find((v) => v.writer === b)!.version),
            );
          for (let i = 1; i < writers.length; i++)
            edges.add(`${writers[i - 1][0]}:${writers[i][0]}`);
        }
        return edges.has('A:B') && edges.has('B:A');
      }
      yield frame(
        scene,
        'Begin from committed versions; private write buffers are not visible to other transactions.',
        c,
        1,
        { isolation: p.isolation },
      );
      for (let i = 0; i < p.operations.length; i++) {
        const op = p.operations[i];
        let t = active.get(op.tx),
          status = '',
          value: number | null = null;
        if (op.kind === 'begin') {
          if (t) status = 'transaction-id-already-used';
          else {
            t = {
              start: i,
              end: null,
              snapshot: null,
              state: 'active',
              writes: new Map(),
              reads: [],
            };
            active.set(op.tx, t);
            status = 'begun';
          }
        } else if (!t || t.state !== 'active')
          status = 'transaction-not-active';
        else if (op.kind === 'write') {
          t.snapshot ??= clock;
          t.writes.set(op.key, op.value);
          c.writes++;
          status = 'buffered';
          value = op.value;
        } else if (op.kind === 'read') {
          t.snapshot ??= clock;
          if (t.writes.has(op.key)) {
            value = t.writes.get(op.key)!;
            status = 'own-write';
          } else {
            const limit = snapshotMode ? (t.snapshot ?? clock) : clock;
            let visible = versions[op.key][0];
            for (const v of versions[op.key]) {
              c.versionChecks++;
              if (v.version <= limit) visible = v;
            }
            value = visible.value;
            t.reads.push({
              key: op.key,
              version: visible.version,
              writer: visible.writer,
              value,
            });
            status = 'committed-version';
            c.reads++;
          }
          yield frame(
            scene,
            'Choose own writes first; otherwise apply the isolation policy to committed version visibility.',
            c,
            3,
            {
              tx: op.tx,
              key: op.key,
              snapshot: t.snapshot,
              currentVersion: clock,
            },
            [],
            {
              prompt: `Which value does ${op.tx} read for ${op.key}?`,
              choices: [
                String(value),
                String(value === 999 ? 998 : value + 1),
                'Uncommitted value from the other transaction',
              ],
              answer: String(value),
              hint: 'Own writes are visible. Other transactions’ private buffers are never visible in this PostgreSQL-oriented model.',
            },
          );
        } else if (op.kind === 'rollback') {
          t.writes.clear();
          t.state = 'aborted';
          t.end = i;
          status = 'rolled-back';
          c.aborts++;
        } else {
          const conflict =
              snapshotMode &&
              [...t.writes.keys()].some(
                (k) => versions[k].at(-1)!.version > (t!.snapshot ?? clock),
              ),
            cycle = p.isolation === 'serializable' && serializationCycle(op.tx);
          if (conflict || cycle) {
            t.state = 'aborted';
            t.end = i;
            t.writes.clear();
            c.aborts++;
            status = conflict
              ? 'write-conflict-abort'
              : 'serialization-cycle-abort';
          } else {
            if (t.writes.size) {
              clock++;
              for (const [k, v] of t.writes)
                versions[k].push({ value: v, version: clock, writer: op.tx });
            }
            t.state = 'committed';
            t.end = i;
            c.commits++;
            status = 'committed';
          }
        }
        history.push({
          operation: i,
          tx: op.tx,
          kind: op.kind,
          status,
          key: 'key' in op ? op.key : null,
          value,
        });
        yield frame(
          scene,
          'An atomic commit publishes every buffered value together or publishes none after an abort.',
          c,
          5,
          { tx: op.tx, status, currentVersion: clock },
          [{ id: op.tx, kind: status.includes('abort') ? 'error' : 'visited' }],
        );
      }
      yield frame(
        {
          ...scene,
          result: {
            isolation: p.isolation,
            effectiveIsolation:
              p.isolation === 'read-uncommitted'
                ? 'read-committed'
                : p.isolation,
            values: {
              x: versions.x.at(-1)!.value,
              y: versions.y.at(-1)!.value,
            },
            versions,
            transactions: Object.fromEntries(
              [...active].map(([id, t]) => [
                id,
                {
                  state: t.state,
                  snapshot: t.snapshot,
                  reads: t.reads,
                  pendingWrites: Object.fromEntries(
                    t.state === 'active' ? t.writes : [],
                  ),
                },
              ]),
            ),
            history,
            commits: c.commits,
            aborts: c.aborts,
          },
        },
        'Snapshot isolation prevents dirty reads and concurrent write conflicts, but disjoint writes can still violate a cross-row invariant. Serializable requires detecting the dependency cycle.',
        c,
        6,
      );
    },
  };
}
