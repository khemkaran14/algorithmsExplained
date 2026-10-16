import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
import { Fifo } from '../collections';
const schema = z
  .object({
    provider: z.enum(['aws', 'gcp']).default('aws'),
    load: z.array(z.number().int().min(0).max(20)).min(1).max(20),
    duration: z.number().int().min(1).max(5).default(2),
    coldStart: z.number().int().min(0).max(5).default(2),
    maxInstances: z.number().int().min(1).max(8).default(4),
    concurrency: z.number().int().min(1).max(8).default(4),
    idleTTL: z.number().int().min(1).max(12).default(4),
    queueLimit: z.number().int().min(0).max(128).default(64),
    drain: z.number().int().min(0).max(12).default(6),
  })
  .strict();
export const serverless: Visualizer<z.infer<typeof schema>> = {
  id: 'lambda-cloud-run',
  maxSize: 20,
  measureSize: (p) => p.load.length,
  inputHint:
    'AWS mapping models one active invocation per Lambda-style execution environment. GCP mapping models configurable Cloud Run request concurrency per container. Cold-start delay, fixed request duration, idle expiry and instance caps are explicit assumptions, not provider benchmarks or exact scaling algorithms. Arrivals wait while an environment starts; active work is never evicted by idle TTL. No external requests or billing API calls occur.',
  controls: [
    {
      key: 'provider',
      label: 'Cloud mapping',
      type: 'select',
      options: [
        { value: 'aws', label: 'AWS Lambda-style environments' },
        { value: 'gcp', label: 'GCP Cloud Run-style containers' },
      ],
    },
    {
      key: 'concurrency',
      label: 'Cloud Run concurrency (Lambda-style fixed at 1)',
      type: 'number',
      min: 1,
      max: 8,
    },
    {
      key: 'maxInstances',
      label: 'Maximum environments / containers',
      type: 'number',
      min: 1,
      max: 8,
    },
    {
      key: 'coldStart',
      label: 'Assumed cold-start ticks',
      type: 'number',
      min: 0,
      max: 5,
    },
    {
      key: 'idleTTL',
      label: 'Assumed warm idle lifetime ticks',
      type: 'number',
      min: 1,
      max: 12,
    },
  ],
  presets: {
    best: schema.parse({ load: [1, 1, 1, 1, 1], coldStart: 0 }),
    average: schema.parse({ load: [0, 4, 8, 8, 0, 0, 0, 0, 2], coldStart: 2 }),
    worst: schema.parse({
      maxInstances: 1,
      coldStart: 4,
      queueLimit: 2,
      load: [20, 20, 20, 0, 0],
    }),
    random: (n) =>
      schema.parse({
        load: Array.from({ length: Math.min(20, Math.max(1, n)) }, (_, i) =>
          i % 5 === 0 ? 8 : 1,
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'Warm available capacity starts an invocation without cold-start wait',
    average: 'O(ticks × environments + requests) bounded scheduling model',
    worst:
      'Cold starts and caps create acquisition wait or rejection during bursts',
    space: 'O(environments + requests + FIFO pending queue)',
    why: 'Lambda and Cloud Run are related serverless concepts with distinct concurrency, lifecycle, quota and billing rules. This model isolates those chosen differences; duration is held fixed and does not simulate CPU sharing.',
    metric: { label: 'Completed invocations', keys: ['completed'] },
  },
  *generate(p) {
    type Request = {
      id: number;
      at: number;
      start: number | null;
      end: number | null;
      environment: number | null;
      state: 'waiting' | 'running' | 'done' | 'rejected';
    };
    type Environment = {
      id: number;
      readyAt: number;
      lastUsed: number;
      state: 'starting' | 'warm' | 'expired';
      jobs: number[];
    };
    const environments: Environment[] = [],
      requests: Request[] = [],
      pending = new Fifo<number>(),
      history: {
        tick: number;
        starting: number;
        warm: number;
        running: number;
        pending: number;
        completed: number;
        rejected: number;
      }[] = [],
      c = counters();
    let serial = 0;
    c.completed = 0;
    c.rejected = 0;
    c.coldStarts = 0;
    c.expired = 0;
    c.occupiedSlotTicks = 0;
    const concurrency = p.provider === 'aws' ? 1 : p.concurrency,
      service =
        p.provider === 'aws'
          ? 'Lambda-style execution environment'
          : 'Cloud Run-style request container';
    function scene(): VisualState {
      return {
        kind: 'architecture',
        values: [],
        nodes: [
          {
            id: 'queue',
            label: `Pending requests: ${pending.length}`,
            x: 0,
            y: 100,
          },
          ...environments
            .filter((e) => e.state !== 'expired')
            .map((environment, i) => ({
              id: `env${environment.id}`,
              label: `${service} ${environment.id}: ${environment.state} (${environment.jobs.length}/${concurrency})`,
              x: 270,
              y: i * 100,
            })),
        ],
        edges: environments
          .filter((e) => e.state !== 'expired')
          .map((e) => ({ from: 'queue', to: `env${e.id}` })),
      };
    }
    function launch(tick: number) {
      const e: Environment = {
        id: serial++,
        readyAt: tick + p.coldStart,
        lastUsed: tick,
        state: p.coldStart ? 'starting' : 'warm',
        jobs: [],
      };
      environments.push(e);
      c.coldStarts++;
      return e;
    }
    function assign(r: Request, e: Environment, tick: number) {
      r.start = tick;
      r.end = tick + p.duration;
      r.environment = e.id;
      r.state = 'running';
      e.jobs.push(r.id);
      e.lastUsed = tick;
    }
    yield frame(
      scene(),
      'Cold starts provision serving capacity; warm concurrency and total environment caps bound how quickly work can begin.',
      c,
      1,
      { provider: p.provider, effectiveConcurrency: concurrency },
    );
    for (let tick = 0; tick < p.load.length + p.drain; tick++) {
      for (const e of environments) {
        if (e.state === 'expired') continue;
        if (e.state === 'starting' && e.readyAt <= tick) e.state = 'warm';
        e.jobs = e.jobs.filter((id) => {
          const r = requests[id];
          if (r.end !== null && r.end <= tick) {
            r.state = 'done';
            e.lastUsed = tick;
            c.completed++;
            return false;
          }
          return true;
        });
        if (
          e.state === 'warm' &&
          !e.jobs.length &&
          tick - e.lastUsed >= p.idleTTL
        ) {
          e.state = 'expired';
          c.expired++;
        }
      }
      // Older waiters get warm slots before arrivals at the same tick.
      for (const e of environments)
        if (e.state === 'warm')
          while (e.jobs.length < concurrency && pending.length)
            assign(requests[pending.shift()!], e, tick);
      const arrivals = tick < p.load.length ? p.load[tick] : 0;
      for (let i = 0; i < arrivals; i++) {
        const r: Request = {
          id: requests.length,
          at: tick,
          start: null,
          end: null,
          environment: null,
          state: 'waiting',
        };
        requests.push(r);
        const warm = environments.find(
          (e) => e.state === 'warm' && e.jobs.length < concurrency,
        );
        if (warm && !pending.length) assign(r, warm, tick);
        else {
          // Starting capacity is reserved for prior pending work, so avoid unnecessary cold starts.
          const live = environments.filter((e) => e.state !== 'expired'),
            reserved =
              live.filter((e) => e.state === 'starting').length * concurrency;
          const canLaunch =
            live.length < p.maxInstances && pending.length + 1 > reserved;
          if (canLaunch) {
            const e = launch(tick);
            if (e.state === 'warm') {
              while (e.jobs.length < concurrency && pending.length)
                assign(requests[pending.shift()!], e, tick);
              if (e.jobs.length < concurrency && !pending.length)
                assign(r, e, tick);
            }
          }
          if (r.state !== 'running') {
            if (pending.length >= p.queueLimit) {
              r.state = 'rejected';
              c.rejected++;
            } else pending.push(r.id);
          }
        }
      }
      // A zero-delay launch can drain queued work immediately, still respecting FIFO order.
      for (const e of environments)
        if (e.state === 'warm')
          while (e.jobs.length < concurrency && pending.length)
            assign(requests[pending.shift()!], e, tick);
      // Backlog without new arrivals may need environments after old ones expired or limits changed.
      while (
        pending.length >
          environments.filter((e) => e.state === 'starting').length *
            concurrency &&
        environments.filter((e) => e.state !== 'expired').length <
          p.maxInstances
      ) {
        const e = launch(tick);
        if (e.state === 'warm')
          while (e.jobs.length < concurrency && pending.length)
            assign(requests[pending.shift()!], e, tick);
      }
      const running = requests.filter((r) => r.state === 'running').length;
      c.occupiedSlotTicks += running;
      const snapshot = {
        tick,
        starting: environments.filter((e) => e.state === 'starting').length,
        warm: environments.filter((e) => e.state === 'warm').length,
        running,
        pending: pending.length,
        completed: c.completed,
        rejected: c.rejected,
      };
      history.push(snapshot);
      yield frame(
        scene(),
        'Separate running work, queued acquisition, cold environments and expired warm capacity.',
        c,
        3,
        snapshot,
        [],
        {
          prompt: 'Can a new arrival avoid cold-start delay right now?',
          choices: [
            'Yes, a warm slot is available',
            'No, it must wait or start cold',
          ],
          answer:
            environments.some(
              (e) => e.state === 'warm' && e.jobs.length < concurrency,
            ) && pending.length === 0
              ? 'Yes, a warm slot is available'
              : 'No, it must wait or start cold',
          hint: 'A starting environment is not warm. Respect effective per-environment concurrency and earlier FIFO waiters.',
        },
      );
    }
    const latencies = requests
        .filter((r) => r.state === 'done')
        .map((r) => r.end! - r.at)
        .sort((a, b) => a - b),
      unfinished = requests.filter((r) =>
        ['running', 'waiting'].includes(r.state),
      ).length;
    yield frame(
      {
        ...scene(),
        result: {
          provider: p.provider,
          effectiveConcurrency: concurrency,
          requests,
          environments,
          history,
          completed: c.completed,
          rejected: c.rejected,
          pending: unfinished,
          coldStarts: c.coldStarts,
          expired: c.expired,
          occupiedSlotTicks: c.occupiedSlotTicks,
          conserved: requests.length === c.completed + c.rejected + unfinished,
          p95CompletedLatencyTicks: latencies.length
            ? latencies[Math.ceil(latencies.length * 0.95) - 1]
            : null,
          assumptions:
            'Fixed service time, chosen idle lifetime/cold delay and cap; occupied slot ticks are work accounting, not a provider price or bill.',
        },
      },
      'Warm reuse, concurrency and cold-start delay affect latency under the chosen assumptions. Real lifecycle guarantees and billing depend on the selected product/configuration.',
      c,
      6,
    );
  },
};
