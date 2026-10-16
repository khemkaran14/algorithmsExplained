import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const tx = z.enum(['A', 'B', 'C']),
  key = z.enum(['x', 'y', 'z']);
const schema = z
  .object({
    detectDeadlocks: z.boolean().default(true),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({
            kind: z.literal('lock'),
            tx,
            key,
            mode: z.enum(['S', 'X']),
          }),
          z.object({ kind: z.literal('commit'), tx }),
          z.object({ kind: z.literal('rollback'), tx }),
        ]),
      )
      .min(1)
      .max(32),
  })
  .strict();
export const locking: Visualizer<z.infer<typeof schema>> = {
  id: 'locking-deadlocks',
  maxSize: 32,
  measureSize: (p) => p.operations.length,
  inputHint:
    'Strict two-phase locking over three transactions and keys: S/S compatible; X excludes other holders. Locks release only on commit or rollback. A blocked transaction cannot issue another operation until its request is granted. Wait-for cycles abort the lexicographically greatest member when detection is enabled. Fair lock-request queueing and upgrades are explicit, not a model of every PostgreSQL lock type.',
  controls: [
    {
      key: 'detectDeadlocks',
      label: 'Detect and abort deadlock victims',
      type: 'boolean',
    },
  ],
  presets: {
    best: schema.parse({
      operations: [
        { kind: 'lock', tx: 'A', key: 'x', mode: 'S' },
        { kind: 'lock', tx: 'B', key: 'x', mode: 'S' },
        { kind: 'commit', tx: 'A' },
        { kind: 'commit', tx: 'B' },
      ],
    }),
    average: schema.parse({
      operations: [
        { kind: 'lock', tx: 'A', key: 'x', mode: 'X' },
        { kind: 'lock', tx: 'B', key: 'y', mode: 'X' },
        { kind: 'lock', tx: 'A', key: 'y', mode: 'X' },
        { kind: 'lock', tx: 'B', key: 'x', mode: 'X' },
        { kind: 'commit', tx: 'A' },
      ],
    }),
    worst: schema.parse({
      detectDeadlocks: false,
      operations: [
        { kind: 'lock', tx: 'A', key: 'x', mode: 'S' },
        { kind: 'lock', tx: 'B', key: 'x', mode: 'S' },
        { kind: 'lock', tx: 'A', key: 'x', mode: 'X' },
        { kind: 'lock', tx: 'B', key: 'x', mode: 'X' },
      ],
    }),
    random: (n) =>
      schema.parse({
        operations: Array.from(
          { length: Math.min(32, Math.max(1, n)) },
          (_, i) =>
            i % 2
              ? { kind: 'commit', tx: ['A', 'B', 'C'][Math.floor(i / 2) % 3] }
              : {
                  kind: 'lock',
                  tx: ['A', 'B', 'C'][Math.floor(i / 2) % 3],
                  key: 'x',
                  mode: 'X',
                },
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'Constant-size compatibility check in this bounded model',
    average: 'Wait-for graph cycle detection O(T + E)',
    worst:
      'Blocked work remains pending when no victim or owner release is available',
    space: 'O(locks + waiters + T + E)',
    why: 'T ≤ 3 transactions. The detector uses a wait-for graph and deterministic victim policy; real engines also consider timeouts, costs and additional lock classes.',
    metric: { label: 'Compatibility checks', keys: ['lockChecks'] },
  },
  *generate(p) {
    type Tx = z.infer<typeof tx>;
    type Key = z.infer<typeof key>;
    type Request = { tx: Tx; key: Key; mode: 'S' | 'X' };
    const holders = new Map<Key, Map<Tx, 'S' | 'X'>>(),
      pending: Request[] = [],
      states = new Map<Tx, string>([
        ['A', 'active'],
        ['B', 'active'],
        ['C', 'active'],
      ]),
      history: { operation: number; tx: string; outcome: string }[] = [],
      victims: Tx[] = [],
      c = counters();
    c.lockChecks = 0;
    c.deadlocks = 0;
    function blockers(r: Request) {
      const held = holders.get(r.key)?.get(r.tx);
      if (held === 'X' || (held === 'S' && r.mode === 'S')) return [];
      const blocked = new Set<Tx>();
      for (const [owner, mode] of holders.get(r.key) ?? []) {
        c.lockChecks++;
        if (owner !== r.tx && (r.mode === 'X' || mode === 'X'))
          blocked.add(owner);
      }
      for (const prior of pending) {
        if (prior === r) break;
        if (
          prior.key === r.key &&
          prior.tx !== r.tx &&
          (r.mode === 'X' || prior.mode === 'X')
        )
          blocked.add(prior.tx);
      }
      return [...blocked];
    }
    function grant(r: Request) {
      let lock = holders.get(r.key);
      if (!lock) {
        lock = new Map();
        holders.set(r.key, lock);
      }
      const previous = lock.get(r.tx);
      lock.set(r.tx, previous === 'X' ? 'X' : r.mode);
      states.set(r.tx, 'active');
      c.writes++;
    }
    function release(owner: Tx) {
      for (const lock of holders.values()) lock.delete(owner);
      for (let i = pending.length - 1; i >= 0; i--)
        if (pending[i].tx === owner) pending.splice(i, 1);
    }
    function wake() {
      for (let i = 0; i < pending.length;) {
        const r = pending[i];
        if (!blockers(r).length) {
          grant(r);
          pending.splice(i, 1);
        } else i++;
      }
    }
    function graph() {
      return pending.flatMap((r) =>
        blockers(r).map((to) => ({ from: r.tx, to })),
      );
    }
    function cycle() {
      const edges = graph(),
        active: Tx[] = [],
        done = new Set<Tx>();
      let found: Tx[] = [];
      function visit(n: Tx) {
        const index = active.indexOf(n);
        if (index >= 0) {
          found = active.slice(index);
          return true;
        }
        if (done.has(n)) return false;
        active.push(n);
        for (const edge of edges.filter((e) => e.from === n))
          if (visit(edge.to)) return true;
        active.pop();
        done.add(n);
        return false;
      }
      for (const n of ['A', 'B', 'C'] as Tx[]) if (visit(n)) break;
      return found;
    }
    function scene(): VisualState {
      return {
        kind: 'architecture',
        values: [],
        nodes: ([...states] as [Tx, string][]).map(([id, state], i) => ({
          id,
          label: `Transaction ${id}: ${state}`,
          x: i * 230,
          y: 80,
        })),
        edges: graph().map((e) => ({ ...e, label: 'waits for' })),
      };
    }
    yield frame(
      scene(),
      'Shared locks coexist; an exclusive request must wait for conflicting owners and earlier conflicting waiters.',
      c,
      1,
    );
    for (let i = 0; i < p.operations.length; i++) {
      const op = p.operations[i];
      let outcome = '';
      const state = states.get(op.tx)!;
      if (state === 'committed' || state === 'aborted')
        outcome = 'ignored-ended-transaction';
      else if (op.kind === 'rollback') {
        release(op.tx);
        states.set(op.tx, 'aborted');
        wake();
        outcome = 'rolled-back';
      } else if (state === 'waiting') outcome = 'blocked-cannot-advance';
      else if (op.kind === 'commit') {
        release(op.tx);
        states.set(op.tx, 'committed');
        wake();
        outcome = 'committed';
      } else {
        const blocked = blockers(op);
        yield frame(
          scene(),
          'Check compatibility before granting this lock request.',
          c,
          3,
          {
            tx: op.tx,
            key: op.key,
            mode: op.mode,
            blockers: blocked.join(','),
          },
          [],
          {
            prompt: 'Can this lock be granted immediately?',
            choices: ['Grant lock', 'Queue and wait'],
            answer: blocked.length ? 'Queue and wait' : 'Grant lock',
            hint: 'Inspect other holders and earlier conflicting requests; a transaction does not conflict with its own held lock.',
          },
        );
        if (blocked.length) {
          pending.push(op);
          states.set(op.tx, 'waiting');
          outcome = 'waiting';
        } else {
          grant(op);
          outcome = 'granted';
        }
        let deadlock = cycle();
        while (deadlock.length) {
          c.deadlocks++;
          if (!p.detectDeadlocks) break;
          const victim = [...deadlock].sort().at(-1)!;
          victims.push(victim);
          release(victim);
          states.set(victim, 'aborted');
          wake();
          outcome += `; victim ${victim}`;
          deadlock = cycle();
        }
      }
      history.push({ operation: i, tx: op.tx, outcome });
      yield frame(
        scene(),
        'After release or victim rollback, grant eligible waiters while preserving conflicting queue order.',
        c,
        5,
        { operation: i, outcome },
        [...states]
          .filter(([, state]) => state === 'aborted')
          .map(([id]) => ({ id, kind: 'error' as const })),
      );
    }
    yield frame(
      {
        ...scene(),
        result: {
          states: Object.fromEntries(states),
          locks: Object.fromEntries(
            [...holders].map(([key, owners]) => [
              key,
              Object.fromEntries(owners),
            ]),
          ),
          pending,
          victims,
          history,
          cycle: cycle(),
        },
      },
      'A pending wait is distinct from a deadlock; a cycle requires a release, timeout or victim rollback to make progress.',
      c,
      6,
    );
  },
};
