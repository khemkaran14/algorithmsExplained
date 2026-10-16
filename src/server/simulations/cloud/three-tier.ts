import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState, JsonValue } from '@/engine/types';
const schema = z
  .object({
    ticks: z.number().int().min(1).max(24).default(12),
    arrivals: z.number().int().min(0).max(30).default(8),
    replicas: z.number().int().min(1).max(8).default(2),
    appCapacity: z.number().int().min(1).max(12).default(4),
    dbCapacity: z.number().int().min(1).max(20).default(4),
    queueLimit: z.number().int().min(0).max(120).default(40),
    cacheHitPercent: z.number().int().min(0).max(100).default(50),
    publicIngress: z.boolean().default(true),
    lbToApp: z.boolean().default(true),
    appToDb: z.boolean().default(true),
    appDbIdentity: z.boolean().default(true),
    dbPublic: z.boolean().default(false),
    failReplica: z.boolean().default(false),
    seed: z.number().int().min(0).max(2147483647).default(42),
  })
  .strict();
export const threeTier: Visualizer<z.infer<typeof schema>> = {
  id: 'deploy-a-three-tier-app',
  maxSize: 24,
  measureSize: (p) => p.ticks,
  inputHint:
    'Local public-catalog workload: public load balancer → private application workers → cache / private database. Independent reachability and DB service-identity gates affect misses; a public cached catalog item may still succeed when the database path fails. Queue capacity, healthy app workers and shared DB work are finite. Exposing the DB is flagged as risk, not proof that authentication is bypassed. No real deployment, account or cloud API calls.',
  controls: [
    {
      key: 'publicIngress',
      label: 'Public HTTPS ingress configured',
      type: 'boolean',
    },
    {
      key: 'lbToApp',
      label: 'Load-balancer to app path allowed',
      type: 'boolean',
    },
    {
      key: 'appToDb',
      label: 'Private app-to-database path allowed',
      type: 'boolean',
    },
    {
      key: 'appDbIdentity',
      label: 'App DB identity authorized',
      type: 'boolean',
    },
    { key: 'dbPublic', label: 'Database has public exposure', type: 'boolean' },
    { key: 'replicas', label: 'App replicas', type: 'number', min: 1, max: 8 },
    {
      key: 'dbCapacity',
      label: 'Shared DB operations per tick',
      type: 'number',
      min: 1,
      max: 20,
    },
    {
      key: 'cacheHitPercent',
      label: 'Public catalog cache hit percent',
      type: 'number',
      min: 0,
      max: 100,
    },
    { key: 'failReplica', label: 'Fail app replica zero', type: 'boolean' },
  ],
  presets: {
    best: schema.parse({
      arrivals: 4,
      cacheHitPercent: 0,
      replicas: 2,
      dbCapacity: 8,
    }),
    average: schema.parse({}),
    worst: schema.parse({
      appDbIdentity: false,
      cacheHitPercent: 0,
      dbPublic: true,
    }),
    random: (n) => schema.parse({ ticks: Math.min(24, Math.max(1, n)) }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'O(requests) cached read handling',
    average: 'O(ticks × arrivals + queue operations)',
    worst: 'Bounded queues reject excess work instead of growing indefinitely',
    space: 'O(queue cap + request accounting)',
    why: 'Network reachability, identity policy and processing capacity are separate gates. A real capstone also needs TLS, backups, migrations, secrets, monitoring, recovery and provider-specific IaC.',
    metric: { label: 'Completed requests', keys: ['completed'] },
  },
  *generate(p) {
    const c = counters();
    c.completed = 0;
    c.rejected = 0;
    c.failed = 0;
    c.cacheHits = 0;
    const app: number[] = [],
      db: number[] = [],
      history: Record<string, JsonValue>[] = [];
    let next = 0,
      random = p.seed >>> 0;
    const draw = () => {
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
      return (random / 4294967296) * 100;
    };
    const scene = (): VisualState => ({
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'lb', label: 'Public HTTPS load balancer', x: 0, y: 0 },
        { id: 'app', label: `Private app: ${app.length} queued`, x: 260, y: 0 },
        { id: 'cache', label: 'Public catalog cache', x: 520, y: 0 },
        {
          id: 'db',
          label: `${p.dbPublic ? 'EXPOSED' : 'Private'} database: ${db.length} queued`,
          x: 520,
          y: 160,
        },
      ],
      edges: [
        { from: 'lb', to: 'app', label: p.lbToApp ? 'allowed' : 'blocked' },
        { from: 'app', to: 'cache' },
        {
          from: 'app',
          to: 'db',
          label:
            p.appToDb && p.appDbIdentity
              ? 'reachable + authorized'
              : 'blocked / denied',
        },
      ],
    });
    yield frame(
      scene(),
      'Configure reachability and least privilege before interpreting scaling results.',
      c,
      1,
    );
    for (let tick = 0; tick < p.ticks; tick++) {
      for (let i = 0; i < p.arrivals; i++) {
        const id = ++next;
        if (
          !p.publicIngress ||
          !p.lbToApp ||
          app.length >= p.queueLimit + p.replicas * p.appCapacity
        )
          c.rejected++;
        else app.push(id);
      }
      const budget = (p.replicas - (p.failReplica ? 1 : 0)) * p.appCapacity;
      for (let i = 0; i < budget && app.length; i++) {
        const id = app.shift()!;
        if (draw() < p.cacheHitPercent) {
          c.cacheHits++;
          c.completed++;
        } else if (!p.appToDb || !p.appDbIdentity) c.failed++;
        else db.push(id);
      }
      for (let i = 0; i < p.dbCapacity && db.length; i++) {
        db.shift();
        c.completed++;
      }
      while (db.length > p.queueLimit) {
        db.pop();
        c.rejected++;
      }
      while (app.length > p.queueLimit) {
        app.pop();
        c.rejected++;
      }
      const pending = app.length + db.length;
      history.push({
        tick,
        offered: next,
        completed: c.completed,
        rejected: c.rejected,
        failed: c.failed,
        pending,
      });
      if (tick === 0)
        yield frame(
          scene(),
          'A reachable database still rejects an unauthorized application identity.',
          c,
          3,
          { appToDb: p.appToDb, identity: p.appDbIdentity },
          [],
          {
            prompt: 'May an uncached request use the database?',
            choices: [
              'Yes, private path and identity both allow it',
              'No, at least one required gate is missing',
            ],
            answer:
              p.appToDb && p.appDbIdentity
                ? 'Yes, private path and identity both allow it'
                : 'No, at least one required gate is missing',
            hint: 'A public DB endpoint is not an identity grant and is unnecessary for this app path.',
          },
        );
      yield frame(
        scene(),
        'Account separately for successes, explicit failures, overload rejections and work still queued.',
        c,
        5,
        {
          tick,
          completed: c.completed,
          rejected: c.rejected,
          failed: c.failed,
          pending,
        },
      );
    }
    yield frame(
      {
        ...scene(),
        result: {
          offered: next,
          completed: c.completed,
          failed: c.failed,
          rejected: c.rejected,
          pending: app.length + db.length,
          cacheHits: c.cacheHits,
          history,
          risks: p.dbPublic ? ['Unnecessary database public exposure'] : [],
          scope:
            'Bounded public-catalog model; no actual deployment or provider guarantee.',
        },
      },
      'A correct diagram must satisfy request accounting and independent network, identity and capacity constraints.',
      c,
      6,
    );
  },
};
