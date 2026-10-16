import 'server-only';
import { z } from 'zod';
import { frame, counters, randomNumbers } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
export function hash32(text: string) {
  let value = 2166136261;
  for (const ch of text)
    value = Math.imul(value ^ ch.charCodeAt(0), 16777619) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
  return (value ^ (value >>> 16)) >>> 0;
}
const shardSchema = z
  .object({
    strategy: z.enum(['modulo', 'range', 'consistent']).default('consistent'),
    nodes: z.array(z.number().int().min(0).max(99)).min(1).max(7),
    keys: z.array(z.number().int().min(0).max(999)).min(1).max(64),
    newNode: z.number().int().min(0).max(99),
    replicas: z.number().int().min(1).max(16).default(4),
  })
  .strict();
export type ShardInput = z.infer<typeof shardSchema>;
export function sharding(
  slug = 'sharding-partitioning',
): Visualizer<ShardInput> {
  return {
    id: slug,
    maxSize: 64,
    measureSize: (input) => input.keys.length,
    inputHint:
      'Compare modulo, fixed 0–999 range partitioning and consistent hashing when adding one physical shard. Nodes are distinct IDs; newNode must not already exist. Virtual tokens improve balance but do not guarantee it for small samples.',
    controls: [
      {
        key: 'strategy',
        label: 'Placement strategy',
        type: 'select',
        options: ['modulo', 'range', 'consistent'].map((value) => ({
          value,
          label: value,
        })),
      },
      {
        key: 'replicas',
        label: 'Virtual tokens per shard',
        type: 'number',
        min: 1,
        max: 16,
      },
    ],
    presets: {
      best: {
        strategy: 'consistent',
        nodes: [0, 1],
        keys: [1],
        newNode: 2,
        replicas: 8,
      },
      average: {
        strategy: 'consistent',
        nodes: [0, 1, 2],
        keys: [5, 20, 42, 76, 99, 183, 250, 500, 750, 999],
        newNode: 3,
        replicas: 4,
      },
      worst: {
        strategy: 'modulo',
        nodes: [0, 1, 2],
        keys: Array.from({ length: 32 }, (_, i) => i),
        newNode: 3,
        replicas: 4,
      },
      random: (n, s) => ({
        strategy: 'consistent',
        nodes: [0, 1, 2],
        keys: randomNumbers(n, s).map((v, i) => (v * 7 + i) % 1000),
        newNode: 3,
        replicas: 4,
      }),
    },
    validateInput(raw) {
      const p = shardSchema.parse(raw);
      if (
        new Set(p.nodes).size !== p.nodes.length ||
        p.nodes.includes(p.newNode)
      )
        throw new Error(
          'Existing shards must be distinct and the added shard must be new.',
        );
      return p;
    },
    complexity: {
      metric: {
        label: 'Keys whose physical owner changed',
        keys: ['migrations'],
      },
      best: 'Modulo/range lookup O(1); consistent successor lookup O(log V)',
      average: 'Virtual-token placement smooths sampled load',
      worst: 'Hot keys and correlated placement can overload one shard',
      space: 'O(keys+virtual tokens) teaching state',
      why: 'Modulo and recomputed equal-width ranges can remap many keys when node count changes. Consistent hashing changes successor ownership only around the added tokens, so migrated keys go to the new node. Placement is not replication, durability or a complete online migration protocol.',
    },
    *generate(input) {
      const c = counters();
      c.migrations = 0;
      c.lookups = 0;
      const nodes = [...input.nodes];
      const owners = new Map<number, number>();
      function tokens() {
        return nodes
          .flatMap((node) =>
            Array.from({ length: input.replicas }, (_, r) => ({
              node,
              hash: hash32(`node:${node}:${r}`),
            })),
          )
          .sort((a, b) => a.hash - b.hash || a.node - b.node);
      }
      let ring = tokens();
      function owner(key: number) {
        c.lookups++;
        if (input.strategy === 'modulo') return nodes[key % nodes.length];
        if (input.strategy === 'range')
          return nodes[
            Math.min(nodes.length - 1, Math.floor((key / 1000) * nodes.length))
          ];
        const hash = hash32(`key:${key}`);
        let lo = 0,
          hi = ring.length;
        while (lo < hi) {
          const mid = lo + Math.floor((hi - lo) / 2);
          c.comparisons++;
          if (ring[mid].hash >= hash) hi = mid;
          else lo = mid + 1;
        }
        return ring[lo % ring.length].node;
      }
      function scene(): VisualState {
        const counts = Object.fromEntries(nodes.map((id) => [id, 0]));
        for (const id of owners.values()) if (id in counts) counts[id]++;
        return {
          kind: 'architecture',
          values: [],
          nodes: [
            { id: 'router', label: `${input.strategy} router`, x: 0, y: 120 },
            ...nodes.map((id, i) => ({
              id: String(id),
              label: `Shard ${id}: ${counts[id]} keys`,
              x: 240 + (i % 4) * 190,
              y: Math.floor(i / 4) * 130,
            })),
          ],
          edges: nodes.map((id) => ({ from: 'router', to: String(id) })),
        };
      }
      yield frame(
        scene(),
        'Partitioning assigns ownership; it does not create additional data copies.',
        c,
        1,
        { strategy: input.strategy },
      );
      for (const key of input.keys) {
        const id = owner(key);
        owners.set(key, id);
        c.writes++;
        yield frame(
          scene(),
          'Resolve this key to one physical owner under the current topology.',
          c,
          3,
          { key, owner: id },
          [{ id: String(id), kind: 'visited' }],
        );
      }
      const before = Object.fromEntries(owners);
      nodes.push(input.newNode);
      ring = tokens();
      yield frame(
        scene(),
        'Add the new shard and recompute only the placement function’s consequences.',
        c,
        4,
        { newNode: input.newNode },
      );
      const moved: { key: number; from: number; to: number }[] = [];
      for (const key of [...owners.keys()]) {
        const old = owners.get(key)!,
          next = owner(key);
        yield frame(
          scene(),
          'Compare the old physical owner with the new topology’s owner.',
          c,
          3,
          { key, oldOwner: old, newOwner: next },
          [],
          {
            prompt: 'Does this key need an ownership migration?',
            choices: ['Move', 'Keep owner'],
            answer: old === next ? 'Keep owner' : 'Move',
            hint: 'Virtual-token changes matter only if the physical successor owner changes.',
          },
        );
        owners.set(key, next);
        if (old !== next) {
          c.migrations++;
          moved.push({ key, from: old, to: next });
          yield frame(
            scene(),
            'Record a changed owner; real migration also needs copy, routing and consistency controls.',
            c,
            5,
            { key, from: old, to: next },
            [{ id: String(next), kind: 'moving' }],
          );
        }
      }
      yield frame(
        {
          ...scene(),
          result: {
            before,
            after: Object.fromEntries(owners),
            moved,
            migrations: moved.length,
            nodeLoads: Object.fromEntries(
              nodes.map((id) => [
                id,
                [...owners.values()].filter((v) => v === id).length,
              ]),
            ),
          },
        },
        'Compare migration cost and skew rather than assuming any placement is automatically balanced.',
        c,
        6,
        { migrations: moved.length },
      );
    },
  };
}
const idsSchema = z
  .object({
    workers: z.array(z.number().int().min(0).max(7)).min(1).max(8),
    events: z
      .array(
        z.object({
          worker: z.number().int().min(0).max(7),
          time: z.number().int().min(0).max(1000000),
        }),
      )
      .min(1)
      .max(64),
    clockPolicy: z.enum(['reject', 'logical-wait']).default('reject'),
    demonstrateDuplicateWorkers: z.boolean().default(false),
  })
  .strict();
export const distributedIds: Visualizer<z.infer<typeof idsSchema>> = {
  id: 'distributed-ids',
  maxSize: 64,
  measureSize: (input) => input.events.length,
  inputHint:
    'Toy Snowflake layout: timestamp << 7 | workerID << 4 | sequence (4 bits). Events name the physical worker index and millisecond time. Unique worker assignments are required unless explicitly demonstrating misconfiguration.',
  controls: [
    {
      key: 'clockPolicy',
      label: 'Clock/sequence policy',
      type: 'select',
      options: [
        { value: 'reject', label: 'Reject rollback or overflow' },
        { value: 'logical-wait', label: 'Advance logical time when needed' },
      ],
    },
    {
      key: 'demonstrateDuplicateWorkers',
      label: 'Allow unsafe duplicate-worker demonstration',
      type: 'boolean',
    },
  ],
  presets: {
    best: {
      workers: [0],
      events: [{ worker: 0, time: 1 }],
      clockPolicy: 'reject',
      demonstrateDuplicateWorkers: false,
    },
    average: {
      workers: [0, 1],
      events: [
        { worker: 0, time: 100 },
        { worker: 1, time: 100 },
        { worker: 0, time: 100 },
        { worker: 0, time: 101 },
      ],
      clockPolicy: 'reject',
      demonstrateDuplicateWorkers: false,
    },
    worst: {
      workers: [0],
      events: Array.from({ length: 20 }, () => ({ worker: 0, time: 1 })),
      clockPolicy: 'reject',
      demonstrateDuplicateWorkers: false,
    },
    random: (n) => ({
      workers: [0, 1],
      events: Array.from({ length: Math.min(64, Math.max(1, n)) }, (_, i) => ({
        worker: i % 2,
        time: Math.floor(i / 4),
      })),
      clockPolicy: 'reject',
      demonstrateDuplicateWorkers: false,
    }),
  },
  validateInput(raw) {
    const p = idsSchema.parse(raw);
    if (p.events.some((e) => e.worker >= p.workers.length))
      throw new Error(
        'Each event must reference an existing physical worker index.',
      );
    if (
      !p.demonstrateDuplicateWorkers &&
      new Set(p.workers).size !== p.workers.length
    )
      throw new Error(
        'Physical workers need unique assigned IDs. Enable the explicit unsafe demonstration to examine collisions.',
      );
    return p;
  },
  complexity: {
    metric: { label: 'IDs issued', keys: ['issued'] },
    best: 'O(1) bounded-word generation per accepted event',
    average:
      'Worker identity and per-timestamp sequence distinguish concurrent IDs',
    worst:
      'Rollback or sequence exhaustion rejects or advances modeled logical time',
    space: 'O(workers) generator state plus trace/collision audit',
    why: 'Uniqueness depends on distinct worker identities, a monotonic effective timestamp and a bounded nonrepeating sequence. This model uses tiny bit fields to make overflow visible. Logical time may run ahead of wall time; sortable IDs can reveal timing and are not access-control tokens.',
  },
  *generate(input) {
    const c = counters(),
      last = input.workers.map(() => -1),
      sequence = input.workers.map(() => 0),
      seen = new Set<string>(),
      history: {
        worker: number;
        observedTime: number;
        effectiveTime: number | null;
        sequence: number | null;
        id: string | null;
        status: string;
      }[] = [];
    c.issued = 0;
    c.rejected = 0;
    c.collisions = 0;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'clock', label: 'Observed wall clock', x: 0, y: 100 },
        ...input.workers.map((worker, i) => ({
          id: String(i),
          label: `Physical ${i}: ID ${worker}`,
          x: 230,
          y: i * 95,
        })),
        {
          id: 'output',
          label: 'Timestamp | worker | sequence',
          x: 480,
          y: 100,
        },
      ],
      edges: input.workers.flatMap((_, i) => [
        { from: 'clock', to: String(i) },
        { from: String(i), to: 'output' },
      ]),
    };
    yield frame(
      scene,
      'Treat worker identity and clock behavior as explicit uniqueness prerequisites.',
      c,
      1,
      { sequenceBits: 4, workerBits: 3 },
    );
    for (const event of input.events) {
      const i = event.worker;
      let time = event.time,
        seq = 0,
        status = 'issued';
      if (time < last[i]) {
        if (input.clockPolicy === 'reject') status = 'clock-rollback';
        else time = last[i];
      }
      if (status === 'issued') {
        seq = time === last[i] ? sequence[i] + 1 : 0;
        if (seq >= 16) {
          if (input.clockPolicy === 'reject') status = 'sequence-overflow';
          else {
            time = last[i] + 1;
            seq = 0;
          }
        }
      }
      yield frame(
        scene,
        'Check timestamp monotonicity and sequence capacity before issuing a value.',
        c,
        3,
        {
          worker: i,
          observedTime: event.time,
          lastTime: last[i],
          nextSequence: seq,
        },
        [{ id: String(i), kind: 'comparing' }],
        {
          prompt:
            'Can duplicate worker identities independently guarantee unique IDs?',
          choices: ['No', 'Yes'],
          answer: 'No',
          hint: 'Two independent generators with the same worker bits and timestamp/sequence can emit identical values.',
        },
      );
      if (status !== 'issued') {
        c.rejected++;
        history.push({
          worker: i,
          observedTime: event.time,
          effectiveTime: null,
          sequence: null,
          id: null,
          status,
        });
        continue;
      }
      last[i] = time;
      sequence[i] = seq;
      const id = (
        (BigInt(time) << 7n) |
        (BigInt(input.workers[i]) << 4n) |
        BigInt(seq)
      ).toString();
      if (seen.has(id)) {
        c.collisions++;
        status = 'collision';
      }
      seen.add(id);
      c.issued++;
      c.writes++;
      history.push({
        worker: i,
        observedTime: event.time,
        effectiveTime: time,
        sequence: seq,
        id,
        status,
      });
      yield frame(
        scene,
        'Combine disjoint bit fields after validating generator state.',
        c,
        5,
        { worker: i, effectiveTime: time, sequence: seq, id },
        [{ id: 'output', kind: status === 'collision' ? 'error' : 'done' }],
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          history,
          issued: c.issued,
          rejected: c.rejected,
          collisions: c.collisions,
          unique: seen.size,
          layout: 'toy: timestamp << 7 | worker << 4 | sequence',
        },
      },
      'Reject unsafe events or make logical advancement explicit; never silently wrap a sequence.',
      c,
      6,
      { issued: c.issued, rejected: c.rejected, collisions: c.collisions },
    );
  },
};
