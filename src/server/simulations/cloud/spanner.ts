import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState, JsonValue } from '@/engine/types';
const schema = z
  .object({
    replicas: z.union([z.literal(3), z.literal(5)]).default(3),
    epsilon: z.number().int().min(0).max(4).default(2),
    commitWait: z.boolean().default(true),
    partition: z.boolean().default(true),
    healAt: z.number().int().min(1).max(16).default(7),
    operations: z
      .array(
        z.object({
          kind: z.enum(['write', 'strong-read', 'stale-read']),
          node: z.number().int().min(0).max(4),
          value: z.number().int().min(0).max(999).default(0),
        }),
      )
      .min(1)
      .max(16),
  })
  .strict()
  .refine(
    (p) => p.operations.every((o) => o.node < p.replicas),
    'Node must be inside replica set',
  );
export const spanner: Visualizer<z.infer<typeof schema>> = {
  id: 'spanner-overview',
  maxSize: 16,
  measureSize: (p) => p.operations.length,
  inputHint:
    'Bounded fixed-majority register with a declared clock-uncertainty interval. A partition isolates node 0 until healAt. Majority writes replicate only within that component. Strong reads need the fixed majority; stale reads inspect a local copy. Commit-wait waits until the earliest possible current time exceeds the chosen timestamp. This is not Paxos, TrueTime infrastructure, or a full Spanner implementation; disabling wait only removes this demonstrated timing condition, not proof of a particular anomaly.',
  controls: [
    {
      key: 'epsilon',
      label: 'Clock uncertainty ticks',
      type: 'number',
      min: 0,
      max: 4,
    },
    {
      key: 'commitWait',
      label: 'Wait past timestamp uncertainty',
      type: 'boolean',
    },
    { key: 'partition', label: 'Isolate replica zero', type: 'boolean' },
  ],
  presets: {
    best: schema.parse({
      partition: false,
      operations: [
        { kind: 'write', node: 0, value: 5 },
        { kind: 'strong-read', node: 2 },
      ],
    }),
    average: schema.parse({
      operations: [
        { kind: 'write', node: 1, value: 5 },
        { kind: 'stale-read', node: 0 },
        { kind: 'strong-read', node: 0 },
        { kind: 'strong-read', node: 2 },
      ],
    }),
    worst: schema.parse({
      commitWait: false,
      operations: [
        { kind: 'write', node: 0, value: 4 },
        { kind: 'write', node: 1, value: 8 },
        { kind: 'stale-read', node: 0 },
      ],
    }),
    random: (n) =>
      schema.parse({
        operations: Array.from(
          { length: Math.min(16, Math.max(1, n)) },
          (_, i) => ({
            kind:
              i % 3 === 0
                ? 'write'
                : i % 3 === 1
                  ? 'strong-read'
                  : 'stale-read',
            node: i % 3,
            value: i + 1,
          }),
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'O(1) local stale read',
    average: 'O(R) replica work per quorum operation',
    worst: 'Minority operations cannot acknowledge a strong result',
    space: 'O(R + operations)',
    why: 'A fixed-majority register and clock wait are separate mechanisms; cross-region latency and consensus recovery are outside this exercise.',
    metric: { label: 'Replica visits', keys: ['reads'] },
  },
  *generate(p) {
    const copies = Array.from({ length: p.replicas }, () => ({
        version: 0,
        value: 0,
      })),
      history: Record<string, JsonValue>[] = [],
      c = counters();
    let clock = 0,
      stamp = 0,
      version = 0;
    const scene = (): VisualState => ({
      kind: 'architecture',
      values: [],
      nodes: copies.map((v, i) => ({
        id: `r${i}`,
        label: `Replica ${i}: v${v.version} = ${v.value}`,
        x: (i % 3) * 220,
        y: Math.floor(i / 3) * 140,
      })),
      edges: copies.slice(1).map((_, i) => ({
        from: 'r0',
        to: `r${i + 1}`,
        label: 'declared quorum register',
      })),
    });
    yield frame(
      scene(),
      'Separate replica agreement from timestamp uncertainty.',
      c,
      1,
    );
    for (let i = 0; i < p.operations.length; i++) {
      const o = p.operations[i],
        split = p.partition && i < p.healAt;
      if (!split) {
        const latest = copies.reduce((a, b) => (a.version > b.version ? a : b));
        for (let j = 0; j < copies.length; j++) copies[j] = { ...latest };
      }
      const component = copies
          .map((_, j) => j)
          .filter((j) => !split || (o.node === 0 ? j === 0 : j !== 0)),
        quorum = component.length >= Math.floor(p.replicas / 2) + 1;
      let status = '',
        value: number | null = null,
        wait = 0,
        guard: boolean | null = null;
      yield frame(
        scene(),
        'Predict the requested consistency boundary before applying the operation.',
        c,
        3,
        { operation: o.kind, node: o.node, component: component.length },
        [],
        {
          prompt: 'Can this operation return a strong result?',
          choices: [
            'Yes, a fixed majority is reachable',
            'No, only a local stale read can proceed',
          ],
          answer: quorum
            ? 'Yes, a fixed majority is reachable'
            : 'No, only a local stale read can proceed',
          hint: 'A local stale read can proceed without a majority; that does not turn its answer into a strong read.',
        },
      );
      if (o.kind === 'write' && quorum) {
        stamp = Math.max(stamp + 1, clock + p.epsilon);
        if (p.commitWait) wait = Math.max(0, stamp + p.epsilon + 1 - clock);
        clock += wait;
        guard = clock - p.epsilon > stamp;
        version++;
        for (const j of component) {
          copies[j] = { version, value: o.value };
          c.writes++;
        }
        status = 'acknowledged';
        value = o.value;
      } else if (o.kind === 'strong-read' && quorum) {
        const latest = component
          .map((j) => copies[j])
          .reduce((a, b) => (a.version > b.version ? a : b));
        value = latest.value;
        c.reads += component.length;
        status = 'strong-read';
      } else if (o.kind === 'stale-read') {
        value = copies[o.node].value;
        c.reads++;
        status = 'local-stale-read';
      } else status = 'majority-unavailable';
      history.push({
        index: i,
        kind: o.kind,
        node: o.node,
        status,
        value,
        clock,
        timestamp: stamp,
        wait,
        timingConditionEstablished: guard,
      });
      clock++;
      yield frame(scene(), status, c, 5, { status, value, wait, clock });
    }
    yield frame(
      {
        ...scene(),
        result: {
          copies,
          history,
          clock,
          scope:
            'Fixed-majority register plus a declared uncertainty wait, not complete distributed SQL or consensus.',
        },
      },
      'Read strength, quorum availability and clock uncertainty are independent declared guarantees.',
      c,
      6,
    );
  },
};
