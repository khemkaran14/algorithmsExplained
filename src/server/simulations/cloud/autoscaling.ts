import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
import { Fifo } from '../collections';
const schema = z
  .object({
    load: z.array(z.number().int().min(0).max(160)).min(1).max(24),
    min: z.number().int().min(1).max(8).default(1),
    max: z.number().int().min(1).max(8).default(6),
    capacity: z.number().int().min(1).max(40).default(10),
    targetPercent: z.number().int().min(20).max(90).default(60),
    metricLag: z.number().int().min(0).max(4).default(1),
    boot: z.number().int().min(0).max(5).default(2),
    cooldown: z.number().int().min(0).max(6).default(2),
    downStabilization: z.number().int().min(1).max(6).default(3),
    queueLimit: z.number().int().min(0).max(512).default(256),
    failAt: z.number().int().min(-1).max(23).default(-1),
  })
  .strict()
  .refine(
    (p) => p.max >= p.min,
    'Maximum instances must be at least the minimum.',
  );
export const autoscaling: Visualizer<z.infer<typeof schema>> = {
  id: 'auto-scaling-managed-instance-groups',
  maxSize: 24,
  measureSize: (p) => p.load.length,
  inputHint:
    'A demand-derived target controller uses lagged offered-load metrics, startup delay, a cooldown and sustained low demand before scale-in. Ready instances process FIFO work up to capacity; startup instances do not. failAt removes initial instance 0 once. Every request is completed, rejected by the bounded queue or pending. This is an illustrative controller, not AWS Auto Scaling or GCP MIG implementation/quotas.',
  controls: [
    { key: 'min', label: 'Minimum instances', type: 'number', min: 1, max: 8 },
    { key: 'max', label: 'Maximum instances', type: 'number', min: 1, max: 8 },
    {
      key: 'targetPercent',
      label: 'Target modeled utilization percent',
      type: 'number',
      min: 20,
      max: 90,
    },
    {
      key: 'boot',
      label: 'Instance startup ticks',
      type: 'number',
      min: 0,
      max: 5,
    },
    {
      key: 'cooldown',
      label: 'Scaling cooldown ticks',
      type: 'number',
      min: 0,
      max: 6,
    },
    {
      key: 'metricLag',
      label: 'Metric delay ticks',
      type: 'number',
      min: 0,
      max: 4,
    },
  ],
  presets: {
    best: schema.parse({ load: Array(12).fill(6) }),
    average: schema.parse({
      load: [5, 5, 30, 60, 60, 60, 20, 10, 5, 5, 5, 5, 5, 5],
    }),
    worst: schema.parse({
      max: 2,
      boot: 4,
      failAt: 4,
      queueLimit: 32,
      load: [5, 100, 100, 100, 100, 100, 100, 100, 5, 5, 5, 5],
    }),
    random: (n) =>
      schema.parse({
        load: Array.from({ length: Math.min(24, Math.max(1, n)) }, (_, i) =>
          i % 8 < 4 ? 10 : 60,
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'An existing ready pool serves stable demand without scaling',
    average:
      'O(ticks × instances + requests) bounded controller/FIFO simulation',
    worst:
      'Lag and startup can accumulate a queue before new capacity becomes ready',
    space: 'O(instances + pending requests + history)',
    why: 'Demand-derived target size is ceil(observed offered work / per-instance target capacity), clipped to configured bounds. Real target tracking uses product-specific signals, health checks, stabilization and cooldown rules.',
    metric: { label: 'Completed requests', keys: ['completed'] },
  },
  *generate(p) {
    type Instance = {
      id: number;
      readyAt: number;
      state: 'starting' | 'ready' | 'removed';
    };
    const instances: Instance[] = Array.from({ length: p.min }, (_, id) => ({
        id,
        readyAt: 0,
        state: 'ready',
      })),
      pending = new Fifo<{ id: number; at: number }>(),
      latencies: number[] = [],
      history: {
        tick: number;
        offered: number;
        observed: number;
        desired: number;
        ready: number;
        starting: number;
        completed: number;
        rejected: number;
        pending: number;
      }[] = [],
      c = counters();
    let desired = p.min,
      serial = p.min,
      next = 0,
      lastScale = -p.cooldown,
      downTicks = 0;
    c.completed = 0;
    c.rejected = 0;
    c.started = p.min;
    c.removed = 0;
    function scene(): VisualState {
      return {
        kind: 'architecture',
        values: [],
        nodes: [
          { id: 'load', label: 'Offered demand + queue', x: 0, y: 80 },
          {
            id: 'controller',
            label: `Target controller: desired ${desired}`,
            x: 240,
            y: 80,
          },
          ...instances
            .filter((i) => i.state !== 'removed')
            .map((instance, i) => ({
              id: `instance${instance.id}`,
              label: `Instance ${instance.id}: ${instance.state}`,
              x: 480,
              y: i * 90,
            })),
        ],
        edges: instances
          .filter((i) => i.state !== 'removed')
          .map((i) => ({ from: 'load', to: `instance${i.id}` })),
      };
    }
    yield frame(
      scene(),
      'A desired replica count is not immediately available serving capacity.',
      c,
      1,
    );
    for (let tick = 0; tick < p.load.length; tick++) {
      for (const instance of instances)
        if (instance.state === 'starting' && instance.readyAt <= tick)
          instance.state = 'ready';
      if (tick === p.failAt) {
        const failed = instances.find(
          (i) => i.id === 0 && i.state !== 'removed',
        );
        if (failed) {
          failed.state = 'removed';
          c.removed++;
        }
      }
      const observed = tick >= p.metricLag ? p.load[tick - p.metricLag] : 0,
        target = Math.max(
          p.min,
          Math.min(
            p.max,
            Math.ceil(observed / ((p.capacity * p.targetPercent) / 100)),
          ),
        );
      downTicks = target < desired ? downTicks + 1 : 0;
      const eligible = tick - lastScale >= p.cooldown,
        scaleUp = eligible && target > desired,
        scaleDown =
          eligible && target < desired && downTicks >= p.downStabilization;
      yield frame(
        scene(),
        'Scale only from the available delayed signal and the configured stabilization rules.',
        c,
        3,
        { tick, observed, target, desired, cooldownReady: eligible },
        [],
        {
          prompt: 'What does the controller do at this tick?',
          choices: [
            'Increase desired capacity',
            'Decrease desired capacity',
            'Keep desired capacity',
          ],
          answer: scaleUp
            ? 'Increase desired capacity'
            : scaleDown
              ? 'Decrease desired capacity'
              : 'Keep desired capacity',
          hint: 'Check the clipped target, cooldown and consecutive low-demand requirement; desired capacity still needs startup time.',
        },
      );
      if (scaleUp || scaleDown) {
        desired = target;
        lastScale = tick;
        downTicks = 0;
      }
      const live = instances.filter((i) => i.state !== 'removed');
      while (live.length < desired) {
        const instance: Instance = {
          id: serial++,
          readyAt: tick + p.boot,
          state: p.boot ? 'starting' : 'ready',
        };
        instances.push(instance);
        live.push(instance);
        c.started++;
      }
      while (live.length > desired) {
        const removed = live.pop()!;
        removed.state = 'removed';
        c.removed++;
      }
      const ready = instances.filter((i) => i.state === 'ready').length;
      let budget = ready * p.capacity,
        completed = 0,
        rejected = 0;
      while (budget > 0 && pending.length) {
        const request = pending.shift()!;
        budget--;
        completed++;
        c.completed++;
        c.reads++;
        latencies.push(tick - request.at);
      }
      for (let i = 0; i < p.load[tick]; i++) {
        const request = { id: next++, at: tick };
        if (budget > 0) {
          budget--;
          completed++;
          c.completed++;
          c.reads++;
          latencies.push(0);
        } else if (pending.length < p.queueLimit) pending.push(request);
        else {
          rejected++;
          c.rejected++;
        }
      }
      history.push({
        tick,
        offered: p.load[tick],
        observed,
        desired,
        ready,
        starting: instances.filter((i) => i.state === 'starting').length,
        completed,
        rejected,
        pending: pending.length,
      });
      yield frame(
        scene(),
        'Use ready capacity, then retain or reject excess work explicitly. Startup capacity contributes no throughput yet.',
        c,
        5,
        history.at(-1)!,
        instances
          .filter((i) => i.state === 'starting')
          .map((i) => ({ id: `instance${i.id}`, kind: 'queued' as const })),
      );
    }
    const offered = p.load.reduce((a, b) => a + b, 0),
      sorted = [...latencies].sort((a, b) => a - b);
    yield frame(
      {
        ...scene(),
        result: {
          history,
          instances,
          offered,
          completed: c.completed,
          rejected: c.rejected,
          pending: pending.length,
          conserved: offered === c.completed + c.rejected + pending.length,
          p95QueueWaitTicks: sorted.length
            ? sorted[Math.ceil(sorted.length * 0.95) - 1]
            : null,
          started: c.started,
          removed: c.removed,
          assumptions:
            'Capacity and time units are illustrative; no vendor autoscaler or cloud instance is invoked.',
        },
      },
      'Scale-out, queueing, health repair and scale-in are separate mechanisms with different delays and resource costs.',
      c,
      6,
    );
  },
};
