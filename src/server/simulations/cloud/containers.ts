import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const schema = z
  .object({
    desired: z.number().int().min(1).max(6).default(3),
    maxSurge: z.number().int().min(0).max(3).default(1),
    maxUnavailable: z.number().int().min(0).max(3).default(0),
    nodes: z.number().int().min(1).max(3).default(2),
    slotsPerNode: z.number().int().min(1).max(4).default(3),
    readyAfter: z.number().int().min(0).max(5).default(2),
    badNewReadiness: z.boolean().default(false),
    failNodeAt: z.number().int().min(-1).max(19).default(-1),
    rollbackAt: z.number().int().min(-1).max(19).default(-1),
    ticks: z.number().int().min(1).max(20).default(12),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.maxSurge + p.maxUnavailable === 0)
      ctx.addIssue({
        code: 'custom',
        message: 'A rollout needs positive surge or unavailability budget.',
      });
    if (p.maxUnavailable > p.desired)
      ctx.addIssue({
        code: 'custom',
        message: 'Unavailability must not exceed desired replicas.',
      });
    if (p.nodes * p.slotsPerNode < p.desired)
      ctx.addIssue({
        code: 'custom',
        message: 'Initial cluster slots must fit desired replicas.',
      });
  });
type Input = z.infer<typeof schema>;
export function containers(
  slug = 'containers-kubernetes-basics',
): Visualizer<Input> {
  return {
    id: slug,
    maxSize: 20,
    measureSize: (p) => p.ticks,
    inputHint:
      'Bounded replica controller, slot scheduler, readiness gates and rolling version change. Only ready pods become service endpoints. maxSurge bounds extra live pods; maxUnavailable bounds deliberate old-pod removal, not external node failures. A failed node 0 stays unavailable. Bad v2 readiness stalls rollout; rollback returns the target to v1. Slots abstract resource requests, not actual Kubernetes scheduling or every Deployment rule.',
    controls: [
      {
        key: 'desired',
        label: 'Desired ready replicas',
        type: 'number',
        min: 1,
        max: 6,
      },
      {
        key: 'maxSurge',
        label: 'Extra rollout pods',
        type: 'number',
        min: 0,
        max: 3,
      },
      {
        key: 'maxUnavailable',
        label: 'Allowed rollout unavailability',
        type: 'number',
        min: 0,
        max: 3,
      },
      {
        key: 'badNewReadiness',
        label: 'New version never becomes ready',
        type: 'boolean',
      },
      {
        key: 'rollbackAt',
        label: 'Rollback tick (-1 = none)',
        type: 'number',
        min: -1,
        max: 19,
      },
      {
        key: 'failNodeAt',
        label: 'Fail node 0 at tick (-1 = none)',
        type: 'number',
        min: -1,
        max: 19,
      },
    ],
    presets: {
      best: schema.parse({ readyAfter: 0 }),
      average: schema.parse({ readyAfter: 2 }),
      worst: schema.parse({ badNewReadiness: true, maxUnavailable: 0 }),
      random: (n) =>
        schema.parse({ ticks: Math.min(20, Math.max(1, n)), readyAfter: 1 }),
    },
    validateInput: (raw) => schema.parse(raw),
    complexity: {
      best: 'Healthy readiness permits a bounded rolling transition',
      average: 'O(ticks × pods × nodes) simple controller and slot scheduling',
      worst:
        'Readiness or resource shortage can stall while old healthy endpoints remain',
      space: 'O(retained pod records + history)',
      why: 'The model omits real kubelet, API-server reconciliation races, probes, disruption budgets, anti-affinity, network policy and autoscaling. A container process and a service endpoint are different states.',
      metric: { label: 'Pods created', keys: ['created'] },
    },
    *generate(p) {
      type Pod = {
        id: number;
        version: 'v1' | 'v2';
        node: number;
        readyAt: number;
        state: 'starting' | 'ready' | 'removed';
      };
      const pods: Pod[] = Array.from({ length: p.desired }, (_, id) => ({
          id,
          version: 'v1',
          node: id % p.nodes,
          readyAt: 0,
          state: 'ready',
        })),
        history: {
          tick: number;
          target: string;
          live: number;
          available: number;
          targetReady: number;
          oldReady: number;
          unscheduled: number;
        }[] = [],
        c = counters();
      let serial = p.desired,
        target: 'v1' | 'v2' = 'v2';
      c.created = p.desired;
      c.removed = 0;
      c.nodeFailures = 0;
      const healthy = (node: number, tick: number) =>
          !(node === 0 && p.failNodeAt >= 0 && tick >= p.failNodeAt),
        live = () => pods.filter((pod) => pod.state !== 'removed'),
        ready = () => pods.filter((pod) => pod.state === 'ready'),
        minimum = p.desired - p.maxUnavailable;
      function slot(tick: number) {
        const nodes = Array.from({ length: p.nodes }, (_, id) => ({
          id,
          load: live().filter((pod) => pod.node === id).length,
        }))
          .filter((n) => healthy(n.id, tick) && n.load < p.slotsPerNode)
          .sort((a, b) => a.load - b.load || a.id - b.id);
        return nodes[0]?.id ?? null;
      }
      function scene(): VisualState {
        return {
          kind: 'architecture',
          values: [],
          nodes: [
            {
              id: 'controller',
              label: `Desired ${p.desired} × ${target}`,
              x: 0,
              y: 80,
            },
            {
              id: 'service',
              label: `Service: ${ready().length} ready endpoints`,
              x: 0,
              y: 240,
            },
            ...live().map((pod, i) => ({
              id: `pod${pod.id}`,
              label: `Node ${pod.node} / ${pod.version} pod ${pod.id}: ${pod.state}`,
              x: 300,
              y: i * 90,
            })),
          ],
          edges: live().flatMap((pod) => [
            { from: 'controller', to: `pod${pod.id}` },
            ...(pod.state === 'ready'
              ? [{ from: 'service', to: `pod${pod.id}` }]
              : []),
          ]),
        };
      }
      yield frame(
        scene(),
        'The controller requests replicas, the scheduler needs resources, and readiness determines which pods can receive traffic.',
        c,
        1,
      );
      for (let tick = 0; tick < p.ticks; tick++) {
        if (p.rollbackAt >= 0 && tick >= p.rollbackAt) target = 'v1';
        for (const pod of live())
          if (!healthy(pod.node, tick)) {
            pod.state = 'removed';
            c.nodeFailures++;
          } else if (
            pod.state === 'starting' &&
            pod.readyAt <= tick &&
            !(pod.version === 'v2' && p.badNewReadiness)
          )
            pod.state = 'ready';
        const targetCount = () =>
          live().filter((pod) => pod.version === target).length;
        const removable = () =>
          live()
            .filter((pod) => pod.version !== target)
            .sort(
              (a, b) =>
                Number(a.state === 'ready') - Number(b.state === 'ready') ||
                a.id - b.id,
            )
            .find(
              (pod) => pod.state !== 'ready' || ready().length - 1 >= minimum,
            );
        const canCreate =
            targetCount() < p.desired &&
            live().length < p.desired + p.maxSurge &&
            slot(tick) !== null,
          canRemove = removable() !== undefined;
        yield frame(
          scene(),
          'Use surge capacity before deleting old pods; remove an old endpoint only within the deliberate rollout budget.',
          c,
          3,
          {
            tick,
            target,
            live: live().length,
            ready: ready().length,
            minAvailable: minimum,
          },
          [],
          {
            prompt: 'What is the next controller action?',
            choices: [
              'Create a target-version pod',
              'Remove an eligible old-version pod',
              'Wait for readiness or resources',
            ],
            answer: canCreate
              ? 'Create a target-version pod'
              : canRemove
                ? 'Remove an eligible old-version pod'
                : 'Wait for readiness or resources',
            hint: 'Check target count, total surge cap, free healthy-node slots, then the ready-endpoint deletion budget.',
          },
        );
        for (let guard = 0; guard < 24; guard++) {
          const node = slot(tick);
          if (
            targetCount() < p.desired &&
            live().length < p.desired + p.maxSurge &&
            node !== null
          ) {
            pods.push({
              id: serial++,
              version: target,
              node,
              readyAt: tick + p.readyAfter,
              state:
                p.readyAfter === 0 && !(target === 'v2' && p.badNewReadiness)
                  ? 'ready'
                  : 'starting',
            });
            c.created++;
            continue;
          }
          const old = removable();
          if (old) {
            old.state = 'removed';
            c.removed++;
            continue;
          }
          break;
        }
        const record = {
          tick,
          target,
          live: live().length,
          available: ready().length,
          targetReady: ready().filter((pod) => pod.version === target).length,
          oldReady: ready().filter((pod) => pod.version !== target).length,
          unscheduled: Math.max(0, p.desired - targetCount()),
        };
        history.push(record);
        yield frame(
          scene(),
          'A pending process is not a ready endpoint. An unhealthy new version may safely stall instead of removing the old service.',
          c,
          5,
          record,
          pods
            .filter((pod) => pod.state === 'starting')
            .map((pod) => ({ id: `pod${pod.id}`, kind: 'queued' as const })),
        );
      }
      const final = history.at(-1)!;
      yield frame(
        {
          ...scene(),
          result: {
            pods,
            history,
            target,
            readyEndpoints: ready().map((pod) => ({
              id: pod.id,
              version: pod.version,
              node: pod.node,
            })),
            complete: final.targetReady === p.desired && final.oldReady === 0,
            stalled: final.targetReady < p.desired || final.oldReady > 0,
            withinSurge: history.every((h) => h.live <= p.desired + p.maxSurge),
            withinNodeSlots: Array.from(
              { length: p.nodes },
              (_, i) =>
                live().filter((pod) => pod.node === i).length <= p.slotsPerNode,
            ).every(Boolean),
            created: c.created,
            controllerRemoved: c.removed,
            nodeLost: c.nodeFailures,
            assumptions:
              'Bounded controller/scheduler/readiness example, not a Kubernetes or ECS control-plane implementation.',
          },
        },
        'Check resource availability, readiness and rollback behavior separately. Deployment progress does not prove application correctness.',
        c,
        6,
      );
    },
  };
}
