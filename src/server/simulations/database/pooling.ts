import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const schema = z
  .object({
    poolSize: z.number().int().min(1).max(8).default(2),
    databaseLimit: z.number().int().min(1).max(16).default(4),
    replicas: z.number().int().min(1).max(8).default(2),
    queueLimit: z.number().int().min(0).max(32).default(12),
    timeout: z.number().int().min(1).max(12).default(4),
    ticks: z.number().int().min(1).max(24).default(16),
    requests: z
      .array(
        z.object({
          at: z.number().int().min(0).max(23),
          replica: z.number().int().min(0).max(7),
          duration: z.number().int().min(1).max(12),
          leak: z.boolean().default(false),
        }),
      )
      .min(1)
      .max(32),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.requests.some((r) => r.replica >= p.replicas))
      ctx.addIssue({
        code: 'custom',
        message: 'Every request replica must exist.',
      });
  });
export const pooling: Visualizer<z.infer<typeof schema>> = {
  id: 'connection-pooling',
  maxSize: 32,
  measureSize: (p) => p.requests.length,
  inputHint:
    'Each app replica owns a local pool capped by poolSize, but all replicas share databaseLimit physical connections. Connections open lazily and remain owned by their replica even when idle. FIFO waiters time out while acquiring; query duration is separate. A leaked checked-out connection completes its query but is never released until process restart (outside the trace). arrivals at tick t occur after releases/timeouts at t.',
  controls: [
    {
      key: 'poolSize',
      label: 'Pool size per replica',
      type: 'number',
      min: 1,
      max: 8,
    },
    {
      key: 'replicas',
      label: 'Application replicas',
      type: 'number',
      min: 1,
      max: 8,
    },
    {
      key: 'databaseLimit',
      label: 'Database connection limit',
      type: 'number',
      min: 1,
      max: 16,
    },
    {
      key: 'timeout',
      label: 'Acquire timeout ticks',
      type: 'number',
      min: 1,
      max: 12,
    },
  ],
  presets: {
    best: schema.parse({
      requests: [
        { at: 0, replica: 0, duration: 1 },
        { at: 2, replica: 0, duration: 1 },
      ],
    }),
    average: schema.parse({
      requests: Array.from({ length: 12 }, (_, i) => ({
        at: Math.floor(i / 3),
        replica: i % 2,
        duration: 3,
      })),
    }),
    worst: schema.parse({
      databaseLimit: 2,
      poolSize: 2,
      requests: [
        { at: 0, replica: 0, duration: 1, leak: true },
        { at: 0, replica: 0, duration: 1, leak: true },
        { at: 1, replica: 1, duration: 1 },
        { at: 2, replica: 0, duration: 1 },
      ],
    }),
    random: (n) =>
      schema.parse({
        requests: Array.from(
          { length: Math.min(32, Math.max(1, n)) },
          (_, i) => ({
            at: Math.floor(i / 4),
            replica: i % 2,
            duration: 1 + (i % 4),
          }),
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'O(1) free-slot acquisition in an indexed pool',
    average: 'Bounded event simulation scans outstanding requests per tick',
    worst:
      'Increasing replica-local caps cannot exceed the shared database limit',
    space: 'O(requests + open connections)',
    why: 'This model has no real database sockets. Pool sizing, serverless replica count, transaction pooling and session-state compatibility need workload/provider validation.',
    metric: { label: 'Acquire attempts', keys: ['acquireAttempts'] },
  },
  *generate(p) {
    type Request = {
      id: number;
      at: number;
      replica: number;
      duration: number;
      leak: boolean;
      state: 'future' | 'waiting' | 'running' | 'done' | 'timeout' | 'rejected';
      start: number | null;
      end: number | null;
      wait: number | null;
    };
    type Connection = {
      id: number;
      replica: number;
      request: number | null;
      leaked: boolean;
    };
    const requests: Request[] = p.requests.map((r, id) => ({
        ...r,
        id,
        state: 'future',
        start: null,
        end: null,
        wait: null,
      })),
      connections: Connection[] = [],
      history: {
        tick: number;
        open: number;
        busy: number;
        leaked: number;
        waiting: number;
        completed: number;
        timeouts: number;
      }[] = [],
      c = counters();
    c.acquireAttempts = 0;
    c.opened = 0;
    c.timeouts = 0;
    c.rejected = 0;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        ...Array.from({ length: p.replicas }, (_, i) => ({
          id: `app${i}`,
          label: `App ${i}: local pool cap ${p.poolSize}`,
          x: 0,
          y: i * 100,
        })),
        {
          id: 'db',
          label: `Shared database cap ${p.databaseLimit}`,
          x: 300,
          y: 100,
        },
        { id: 'wait', label: 'FIFO acquisition queues', x: 580, y: 100 },
      ],
      edges: Array.from({ length: p.replicas }, (_, i) => ({
        from: `app${i}`,
        to: 'db',
      })),
    };
    yield frame(
      scene,
      'Budget connections across all replicas, not one process in isolation.',
      c,
      1,
    );
    function tryAcquire(r: Request, tick: number) {
      c.acquireAttempts++;
      let connection = connections.find(
        (con) =>
          con.replica === r.replica && con.request === null && !con.leaked,
      );
      if (
        !connection &&
        connections.length < p.databaseLimit &&
        connections.filter((con) => con.replica === r.replica).length <
          p.poolSize
      ) {
        connection = {
          id: connections.length,
          replica: r.replica,
          request: null,
          leaked: false,
        };
        connections.push(connection);
        c.opened++;
      }
      if (!connection) return false;
      connection.request = r.id;
      r.state = 'running';
      r.start = tick;
      r.end = tick + r.duration;
      r.wait = tick - r.at;
      return true;
    }
    for (let tick = 0; tick < p.ticks; tick++) {
      for (const con of connections) {
        if (con.request === null || con.leaked) continue;
        const r = requests[con.request];
        if (r.end !== null && r.end <= tick) {
          r.state = 'done';
          if (r.leak) con.leaked = true;
          else con.request = null;
        }
      }
      for (const r of requests)
        if (r.state === 'waiting' && tick - r.at >= p.timeout) {
          r.state = 'timeout';
          c.timeouts++;
        }
      // Old FIFO waiters try first; per-replica queues cannot borrow another replica's idle connection.
      for (const r of requests
        .filter((r) => r.state === 'waiting')
        .sort((a, b) => a.at - b.at || a.id - b.id))
        tryAcquire(r, tick);
      for (const r of requests.filter(
        (r) => r.state === 'future' && r.at === tick,
      )) {
        const prior = requests.some(
            (other) => other.state === 'waiting' && other.replica === r.replica,
          ),
          canAcquire =
            !prior &&
            (connections.some(
              (con) =>
                con.replica === r.replica &&
                con.request === null &&
                !con.leaked,
            ) ||
              (connections.length < p.databaseLimit &&
                connections.filter((con) => con.replica === r.replica).length <
                  p.poolSize));
        yield frame(
          scene,
          'A connection must belong to this replica and be idle, or a new one must fit both caps.',
          c,
          3,
          { tick, request: r.id, replica: r.replica, open: connections.length },
          [],
          {
            prompt: 'What happens to this new acquisition?',
            choices: [
              'Run with a connection',
              'Wait for a connection',
              'Reject full wait queue',
            ],
            answer: canAcquire
              ? 'Run with a connection'
              : requests.filter(
                    (other) =>
                      other.state === 'waiting' && other.replica === r.replica,
                  ).length < p.queueLimit
                ? 'Wait for a connection'
                : 'Reject full wait queue',
            hint: 'Account for local ownership, shared database capacity, prior waiters and the bounded queue.',
          },
        );
        const got = !prior && tryAcquire(r, tick);
        if (!got) {
          if (
            requests.filter(
              (other) =>
                other.state === 'waiting' && other.replica === r.replica,
            ).length >= p.queueLimit
          ) {
            r.state = 'rejected';
            c.rejected++;
          } else r.state = 'waiting';
        }
      }
      const snapshot = {
        tick,
        open: connections.length,
        busy: connections.filter((con) => con.request !== null && !con.leaked)
          .length,
        leaked: connections.filter((con) => con.leaked).length,
        waiting: requests.filter((r) => r.state === 'waiting').length,
        completed: requests.filter((r) => r.state === 'done').length,
        timeouts: c.timeouts,
      };
      history.push(snapshot);
      yield frame(
        scene,
        'Track idle ownership, checked-out work, leaked slots and acquisition waits separately.',
        c,
        5,
        snapshot,
        connections
          .filter((con) => con.leaked)
          .map((con) => ({ id: `app${con.replica}`, kind: 'error' as const })),
      );
    }
    const completed = requests.filter((r) => r.state === 'done').length,
      rejected = requests.filter((r) => r.state === 'rejected').length,
      timedOut = requests.filter((r) => r.state === 'timeout').length,
      pending = requests.length - completed - rejected - timedOut;
    yield frame(
      {
        ...scene,
        result: {
          requests,
          connections,
          history,
          completed,
          rejected,
          timedOut,
          pending,
          conserved:
            completed + rejected + timedOut + pending === requests.length,
          withinDatabaseLimit: connections.length <= p.databaseLimit,
          withinLocalLimits: Array.from(
            { length: p.replicas },
            (_, i) =>
              connections.filter((con) => con.replica === i).length <=
              p.poolSize,
          ).every(Boolean),
          maximumConfigured: p.poolSize * p.replicas,
        },
      },
      'Acquisition timeout is not query timeout. Larger pools may only move the bottleneck or exhaust the shared database connection budget.',
      c,
      6,
    );
  },
};
