import 'server-only';
import { Fifo } from './collections';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type {
  Visualizer,
  Frame,
  VisualState,
  LessonControl,
} from '@/engine/types';
export const trafficSchema = z
  .object({
    requests: z.number().int().min(0).max(100).default(24),
    ticks: z.number().int().min(1).max(20).default(8),
    replicas: z.number().int().min(1).max(8).default(2),
    cpu: z.number().int().min(1).max(8).default(1),
    capacity: z.number().int().min(1).max(64).default(16),
    cacheHit: z.number().int().min(0).max(100).default(50),
    queueLimit: z.number().int().min(1).max(512).default(128),
    fault: z
      .enum(['none', 'service', 'database', 'cache', 'region'])
      .default('none'),
    failAt: z.number().int().min(0).max(19).default(3),
    restoreAt: z.number().int().min(0).max(20).default(0),
    provider: z.enum(['aws', 'gcp']).default('aws'),
    seed: z.number().int().min(0).max(4294967295).default(42),
  })
  .strict()
  .refine(
    (v) => v.restoreAt === 0 || v.restoreAt > v.failAt,
    'Restore time must follow failure time, or be zero for no recovery.',
  );
export type TrafficInput = z.infer<typeof trafficSchema>;
export type TrafficProfile = {
  slug: string;
  title: string;
  databaseCapacity: number;
  edgeCache?: boolean;
  gateway?: boolean;
  services?: { aws: string; gcp: string };
  database?: { aws: string; gcp: string };
  why: string;
};
export const trafficControls: LessonControl[] = [
  {
    key: 'requests',
    label: 'Requests per second',
    type: 'number',
    min: 0,
    max: 100,
  },
  { key: 'replicas', label: 'App replicas', type: 'number', min: 1, max: 8 },
  {
    key: 'cpu',
    label: 'CPU units per replica',
    type: 'number',
    min: 1,
    max: 8,
  },
  {
    key: 'cacheHit',
    label: 'Cache hit target %',
    type: 'number',
    min: 0,
    max: 100,
  },
  {
    key: 'fault',
    label: 'Break mode',
    type: 'select',
    options: ['none', 'service', 'database', 'cache', 'region'].map(
      (value) => ({ value, label: value }),
    ),
  },
  { key: 'failAt', label: 'Failure second', type: 'number', min: 0, max: 19 },
  {
    key: 'restoreAt',
    label: 'Recovery second (0 = never)',
    type: 'number',
    min: 0,
    max: 20,
  },
  {
    key: 'provider',
    label: 'Cloud mapping',
    type: 'select',
    options: [
      { value: 'aws', label: 'AWS' },
      { value: 'gcp', label: 'GCP' },
    ],
  },
];
export function trafficVisualizer(
  profile: TrafficProfile,
): Visualizer<TrafficInput> {
  const average = trafficSchema.parse({}),
    worst = trafficSchema.parse({
      requests: 100,
      replicas: 1,
      capacity: 8,
      cacheHit: 0,
      fault: 'database',
      failAt: 3,
    });
  return {
    id: profile.slug,
    controls: trafficControls,
    inputHint:
      'Edit requests/second, replica count, per-replica CPU, cache hit target and a timed failure. One tick is one modeled second. Capacities and latency are illustrative model assumptions, not cloud benchmarks.',
    maxSize: 100,
    measureSize: (input) => input.requests,
    presetLabels: {
      best: 'Below capacity',
      average: 'Balanced traffic',
      worst: 'Overload and database outage',
    },
    presets: {
      best: trafficSchema.parse({ requests: 4, cacheHit: 80 }),
      average,
      worst,
      random: (n, seed = 42) =>
        trafficSchema.parse({ requests: Math.min(100, n), seed }),
    },
    validateInput: (raw) => trafficSchema.parse(raw),
    complexity: {
      metric: {
        label: 'Requests processed at the app tier',
        keys: ['appProcessed'],
      },
      best: 'Below bottleneck capacity: bounded backlog',
      average: 'Throughput limited by service and database capacity',
      worst: 'Sustained overload grows queues until admission rejects',
      space: 'Bounded queues plus O(replicas) metrics',
      why:
        profile.why +
        ' The simulator costs O(T·R) for T ticks and R offered requests per tick, using bounded FIFO queues. Results are deterministic workload-model outcomes, not production latency estimates.',
    },
    *generate(input) {
      type Request = { id: number; arrived: number };
      const c = counters(),
        appQueue = new Fifo<Request>(),
        databaseQueue = new Fifo<Request>(),
        latencies: number[] = [],
        perReplica = Array(input.replicas).fill(0) as number[],
        history: {
          tick: number;
          offered: number;
          completed: number;
          pending: number;
          rejected: number;
          outage: boolean;
        }[] = [];
      let nextId = 0,
        roundRobin = 0,
        accepted = 0,
        completed = 0,
        rejected = 0,
        cacheHits = 0,
        cacheMisses = 0,
        random = input.seed >>> 0;
      const draw = () => {
        random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
        return random % 100;
      };
      c.offered = 0;
      c.appProcessed = 0;
      c.databaseReads = 0;
      function scene(tick: number): VisualState {
        const outage =
            input.fault !== 'none' &&
            tick >= input.failAt &&
            (input.restoreAt === 0 || tick < input.restoreAt),
          service = profile.services ?? {
            aws: 'EC2 app',
            gcp: 'Compute Engine app',
          },
          database = profile.database ?? {
            aws: 'RDS database',
            gcp: 'Cloud SQL database',
          };
        const nodes = [
          { id: 'client', label: 'Clients', x: 0, y: 110 },
          {
            id: 'edge',
            label: profile.edgeCache
              ? input.provider === 'aws'
                ? 'CloudFront'
                : 'Cloud CDN'
              : profile.gateway
                ? 'API gateway'
                : 'DNS / ingress',
            x: 180,
            y: 110,
          },
          {
            id: 'lb',
            label: input.provider === 'aws' ? 'ALB' : 'Cloud Load Balancing',
            x: 360,
            y: 110,
          },
          ...perReplica.map((_, i) => ({
            id: `app${i}`,
            label: `${service[input.provider]} ${i + 1}${outage && (input.fault === 'region' || (input.fault === 'service' && i === 0)) ? ' · down' : ''}`,
            x: 560,
            y: 20 + i * 90,
          })),
          {
            id: 'cache',
            label: input.provider === 'aws' ? 'ElastiCache' : 'Memorystore',
            x: 770,
            y: 40,
          },
          {
            id: 'db',
            label:
              database[input.provider] +
              (outage &&
              (input.fault === 'database' || input.fault === 'region')
                ? ' · down'
                : ''),
            x: 980,
            y: 150,
          },
        ];
        return {
          kind: 'architecture',
          provider: input.provider,
          values: [],
          nodes,
          edges: [
            { from: 'client', to: 'edge' },
            { from: 'edge', to: 'lb' },
            ...perReplica.flatMap((_, i) => [
              { from: 'lb', to: `app${i}` },
              { from: `app${i}`, to: 'cache' },
              { from: `app${i}`, to: 'db' },
            ]),
            { from: 'cache', to: 'db' },
          ],
        };
      }
      function emit(
        text: string,
        line: number,
        tick: number,
        marks: Frame['highlights'] = [],
        action?: Frame['action'],
      ) {
        return frame(
          scene(tick),
          text,
          c,
          line,
          {
            second: tick,
            accepted,
            completed,
            rejected,
            appPending: appQueue.length,
            databasePending: databaseQueue.length,
            cacheHits,
            cacheMisses,
          },
          marks,
          action,
        );
      }
      const finish = (request: Request, tick: number, edge: boolean) => {
        completed++;
        latencies.push((tick - request.arrived + 1) * (edge ? 20 : 1000));
      };
      yield emit(
        'Set explicit workload, capacity, failure-domain and queue assumptions.',
        1,
        0,
      );
      for (let tick = 0; tick < input.ticks; tick++) {
        const outage =
            input.fault !== 'none' &&
            tick >= input.failAt &&
            (input.restoreAt === 0 || tick < input.restoreAt),
          regionDown = outage && input.fault === 'region',
          cacheDown =
            (regionDown && !profile.edgeCache) ||
            (outage && input.fault === 'cache'),
          dbDown = regionDown || (outage && input.fault === 'database'),
          healthy = perReplica
            .map((_, i) => i)
            .filter(
              (i) =>
                !regionDown &&
                !(outage && input.fault === 'service' && i === 0),
            );
        const beforeCompleted = completed;
        for (let i = 0; i < input.requests; i++) {
          const request = { id: nextId++, arrived: tick };
          c.offered++;
          if (profile.edgeCache && !cacheDown && draw() < input.cacheHit) {
            accepted++;
            cacheHits++;
            finish(request, tick, true);
            continue;
          }
          if (regionDown) {
            rejected++;
            continue;
          }
          if (appQueue.length >= input.queueLimit) {
            rejected++;
            continue;
          }
          appQueue.push(request);
          accepted++;
          c.writes++;
        }
        yield emit(
          'Admit arrivals into bounded capacity; rejected arrivals never enter an invisible queue.',
          2,
          tick,
          [{ id: 'client->edge', kind: 'moving' }],
        );
        let budget = healthy.length * input.capacity * input.cpu;
        while (appQueue.length && budget-- > 0) {
          const request = appQueue.shift()!,
            replica = healthy[roundRobin++ % healthy.length];
          perReplica[replica]++;
          c.appProcessed++;
          c.reads++;
          if (!profile.edgeCache && !cacheDown && draw() < input.cacheHit) {
            cacheHits++;
            finish(request, tick, false);
          } else {
            cacheMisses++;
            if (databaseQueue.length >= input.queueLimit) {
              rejected++;
              accepted--;
            } else {
              databaseQueue.push(request);
              c.writes++;
            }
          }
        }
        yield emit(
          'App capacity scales only while downstream resources and failure domains permit it.',
          3,
          tick,
          healthy.map((i) => ({ id: `app${i}`, kind: 'visited' })),
          {
            prompt: 'Can more app replicas remove every database bottleneck?',
            choices: ['No', 'Yes'],
            answer: 'No',
            hint: 'The database has its own finite modeled service rate and can fail independently.',
          },
        );
        if (!dbDown) {
          let dbBudget = profile.databaseCapacity;
          while (databaseQueue.length && dbBudget-- > 0) {
            finish(databaseQueue.shift()!, tick, false);
            c.databaseReads++;
            c.reads++;
          }
        }
        history.push({
          tick,
          offered: input.requests,
          completed: completed - beforeCompleted,
          pending: appQueue.length + databaseQueue.length,
          rejected,
          outage,
        });
        yield emit(
          outage
            ? 'The injected failure changes available capacity and cache/database pressure.'
            : 'Complete this second’s available database work and retain outstanding requests.',
          5,
          tick,
          outage
            ? [
                {
                  id:
                    input.fault === 'database'
                      ? 'db'
                      : input.fault === 'cache'
                        ? 'cache'
                        : 'app0',
                  kind: 'error',
                },
              ]
            : [{ id: 'db', kind: 'done' }],
        );
      }
      latencies.sort((a, b) => a - b);
      const pending = appQueue.length + databaseQueue.length,
        p95 = latencies.length
          ? latencies[Math.max(0, Math.ceil(latencies.length * 0.95) - 1)]
          : null,
        f = emit(
          'Account for every offered request as completed, pending or rejected.',
          6,
          input.ticks - 1,
        );
      f.state.result = {
        offered: c.offered,
        accepted,
        completed,
        pending,
        rejected,
        cacheHits,
        cacheMisses,
        perReplica,
        modeledP95Ms: p95,
        modeledCompletedPerSecond: completed / input.ticks,
        conserved: c.offered === completed + pending + rejected,
        history,
      };
      yield f;
    },
  };
}
