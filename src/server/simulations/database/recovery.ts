import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const key = z.enum(['x', 'y']),
  tx = z.enum(['A', 'B']);
const schema = z
  .object({
    walBeforePage: z.boolean().default(true),
    synchronousCommit: z.boolean().default(true),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({
            kind: z.literal('write'),
            tx,
            key,
            value: z.number().int().min(-999).max(999),
          }),
          z.object({ kind: z.literal('commit'), tx }),
          z.object({ kind: z.literal('flush-log') }),
          z.object({ kind: z.literal('flush-page'), key }),
          z.object({ kind: z.literal('crash-recover') }),
        ]),
      )
      .min(1)
      .max(24),
  })
  .strict();
export const recovery: Visualizer<z.infer<typeof schema>> = {
  id: 'write-ahead-log-recovery',
  maxSize: 24,
  measureSize: (p) => p.operations.length,
  inputHint:
    'Small steal/no-force recovery exercise: uncommitted pages may reach disk, but WAL must be durable first; synchronous commit forces its commit record. Recovery redoes durable updates then undoes loser transactions in reverse order. This bounded single-recovery model deliberately omits checkpoints, compensation log records and crashes during recovery, so it is not complete ARIES. Concurrent writes to the same key by different open transactions are rejected rather than bypassing locks.',
  controls: [
    {
      key: 'walBeforePage',
      label: 'Force WAL before flushing a data page',
      type: 'boolean',
    },
    {
      key: 'synchronousCommit',
      label: 'Force commit record before acknowledging',
      type: 'boolean',
    },
  ],
  presets: {
    best: schema.parse({
      operations: [
        { kind: 'write', tx: 'A', key: 'x', value: 7 },
        { kind: 'commit', tx: 'A' },
        { kind: 'crash-recover' },
      ],
    }),
    average: schema.parse({
      operations: [
        { kind: 'write', tx: 'A', key: 'x', value: 7 },
        { kind: 'commit', tx: 'A' },
        { kind: 'write', tx: 'B', key: 'y', value: 9 },
        { kind: 'flush-page', key: 'y' },
        { kind: 'crash-recover' },
      ],
    }),
    worst: schema.parse({
      walBeforePage: false,
      operations: [
        { kind: 'write', tx: 'A', key: 'x', value: 7 },
        { kind: 'flush-page', key: 'x' },
        { kind: 'crash-recover' },
      ],
    }),
    random: (n) =>
      schema.parse({
        operations: [
          ...Array.from({ length: Math.min(20, Math.max(1, n)) }, (_, i) => ({
            kind: 'write',
            tx: 'A',
            key: i % 2 ? 'x' : 'y',
            value: i,
          })),
          { kind: 'commit', tx: 'A' },
          { kind: 'crash-recover' },
        ],
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'Redo skips pages already carrying a sufficient page LSN',
    average: 'O(L + P) retained-log recovery in this bounded model',
    worst:
      'Lost WAL can make an uncommitted disk page impossible to undo safely',
    space: 'O(L + P) log records and page state',
    why: 'L log records, P two pages. A real engine needs transaction analysis, checkpoints, CLRs, repeated-crash safety and WAL integrity checks beyond this teaching pass.',
    metric: { label: 'Recovery log scans', keys: ['recoveryScans'] },
  },
  *generate(p) {
    type Tx = z.infer<typeof tx>;
    type Key = z.infer<typeof key>;
    type Page = { value: number; lsn: number };
    type LogRecord = {
      lsn: number;
      tx: Tx;
      kind: 'update' | 'commit';
      key: Key | null;
      before: Page | null;
      after: number | null;
    };
    const disk: Record<Key, Page> = {
        x: { value: 0, lsn: 0 },
        y: { value: 0, lsn: 0 },
      },
      buffer: Record<Key, Page> = structuredClone(disk),
      log: LogRecord[] = [],
      states = new Map<Tx, string>(),
      locks = new Map<Key, Tx>(),
      acknowledged = new Set<Tx>(),
      history: { step: number; kind: string; outcome: string }[] = [],
      c = counters();
    let durable = 0,
      crashed = false,
      unsafeFlushes = 0;
    c.recoveryScans = 0;
    c.redone = 0;
    c.undone = 0;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'buffer', label: 'Volatile dirty pages', x: 0, y: 100 },
        { id: 'wal', label: 'Append-only WAL buffer', x: 240, y: 0 },
        { id: 'durable', label: 'Durable WAL prefix', x: 480, y: 0 },
        { id: 'disk', label: 'Persistent data pages', x: 480, y: 160 },
      ],
      edges: [
        { from: 'buffer', to: 'wal', label: 'log update' },
        { from: 'wal', to: 'durable', label: 'force WAL' },
        { from: 'buffer', to: 'disk', label: 'page flush' },
        { from: 'durable', to: 'disk', label: 'redo / undo' },
      ],
    };
    yield frame(
      scene,
      'Data pages and transaction commit records become durable through different writes. Enforce write-ahead ordering.',
      c,
      1,
    );
    for (let step = 0; step < p.operations.length; step++) {
      const op = p.operations[step];
      let outcome = '';
      if (crashed) outcome = 'single-recovery-trace-ended';
      else if (op.kind === 'write') {
        if (states.get(op.tx) === 'committed')
          outcome = 'transaction-already-ended';
        else if (locks.has(op.key) && locks.get(op.key) !== op.tx)
          outcome = 'write-conflict-blocked';
        else {
          states.set(op.tx, 'active');
          locks.set(op.key, op.tx);
          const record: LogRecord = {
            lsn: log.length + 1,
            tx: op.tx,
            kind: 'update',
            key: op.key,
            before: { ...buffer[op.key] },
            after: op.value,
          };
          log.push(record);
          buffer[op.key] = { value: op.value, lsn: record.lsn };
          c.writes++;
          outcome = 'logged-and-buffered';
        }
      } else if (op.kind === 'commit') {
        if (states.get(op.tx) !== 'active') outcome = 'transaction-not-active';
        else {
          log.push({
            lsn: log.length + 1,
            tx: op.tx,
            kind: 'commit',
            key: null,
            before: null,
            after: null,
          });
          states.set(op.tx, 'committed');
          if (p.synchronousCommit) durable = log.length;
          acknowledged.add(op.tx);
          for (const [k, owner] of locks) if (owner === op.tx) locks.delete(k);
          outcome = 'commit-acknowledged';
        }
      } else if (op.kind === 'flush-log') {
        durable = log.length;
        outcome = 'WAL-forced';
      } else if (op.kind === 'flush-page') {
        yield frame(
          scene,
          'A dirty page must not reach disk before its update log record is durable.',
          c,
          3,
          { page: op.key, pageLSN: buffer[op.key].lsn, durableLSN: durable },
          [],
          {
            prompt: 'Does this page require a WAL force before a safe flush?',
            choices: ['Force WAL first', 'WAL is already durable'],
            answer:
              buffer[op.key].lsn > durable
                ? 'Force WAL first'
                : 'WAL is already durable',
            hint: 'Compare the page LSN with the durable log prefix.',
          },
        );
        if (p.walBeforePage) durable = Math.max(durable, buffer[op.key].lsn);
        else if (buffer[op.key].lsn > durable) unsafeFlushes++;
        disk[op.key] = { ...buffer[op.key] };
        c.writes++;
        outcome = 'page-flushed';
      } else {
        crashed = true;
        const persisted = log.slice(0, durable),
          winners = new Set(
            persisted.filter((r) => r.kind === 'commit').map((r) => r.tx),
          );
        for (const record of persisted) {
          c.recoveryScans++;
          if (
            record.kind === 'update' &&
            record.key &&
            disk[record.key].lsn < record.lsn
          ) {
            disk[record.key] = { value: record.after!, lsn: record.lsn };
            c.redone++;
          }
        }
        for (const record of [...persisted].reverse()) {
          c.recoveryScans++;
          if (
            record.kind === 'update' &&
            record.key &&
            !winners.has(record.tx)
          ) {
            disk[record.key] = { ...record.before! };
            c.undone++;
          }
        }
        for (const owner of states.keys())
          states.set(
            owner,
            winners.has(owner) ? 'committed' : 'rolled-back-by-recovery',
          );
        outcome = 'recovered-durable-prefix';
      }
      history.push({ step, kind: op.kind, outcome });
      yield frame(
        scene,
        'Track which records and pages actually survived, not just which operations the client attempted.',
        c,
        5,
        { step, outcome, durableLSN: durable, logRecords: log.length },
        unsafeFlushes ? [{ id: 'disk', kind: 'error' }] : [],
      );
    }
    const durableWinners = new Set(
      log
        .slice(0, durable)
        .filter((r) => r.kind === 'commit')
        .map((r) => r.tx),
    );
    yield frame(
      {
        ...scene,
        result: {
          disk,
          bufferLostOnCrash: crashed,
          durableLog: log.slice(0, durable),
          lostLogRecords: crashed ? log.length - durable : 0,
          states: Object.fromEntries(states),
          acknowledged: [...acknowledged],
          lostAcknowledgedCommits: crashed
            ? [...acknowledged].filter((tx) => !durableWinners.has(tx))
            : [],
          unsafeFlushes,
          redone: c.redone,
          undone: c.undone,
          history,
          recoveryGuarantee:
            unsafeFlushes === 0
              ? 'WAL ordering preserved within this bounded model'
              : 'Unsafe page flush: missing log may prevent undo; no atomicity guarantee',
        },
      },
      'A commit is durable only under its configured forcing guarantee. Never claim safe undo when the required before-image log was lost.',
      c,
      6,
    );
  },
};
