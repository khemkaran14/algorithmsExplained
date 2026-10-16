import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, Frame, VisualState } from '@/engine/types';
const operation = z
  .object({
    kind: z.enum(['read', 'write']),
    node: z.enum(['A', 'B']),
    client: z.string().min(1).max(16).default('client'),
    value: z.number().int().min(-999).max(999).optional(),
  })
  .strict()
  .refine(
    (v) => v.kind === 'read' || v.value !== undefined,
    'Writes need a value.',
  );
export const consistencySchema = z
  .object({
    mode: z.enum(['strong', 'eventual', 'session']).default('eventual'),
    operations: z.array(operation).min(1).max(24),
    delay: z.number().int().min(0).max(8).default(2),
    partitionAt: z.number().int().min(-1).max(23).default(-1),
    healAt: z.number().int().min(-1).max(24).default(-1),
  })
  .strict()
  .refine(
    (v) => v.healAt === -1 || (v.partitionAt >= 0 && v.healAt > v.partitionAt),
    'Healing must occur after a configured partition.',
  );
export type ConsistencyInput = z.infer<typeof consistencySchema>;
export function consistencyVisualizer(
  slug: string,
): Visualizer<ConsistencyInput> {
  const operations = [
      { kind: 'write', node: 'A', client: 'alice', value: 7 },
      { kind: 'read', node: 'B', client: 'bob' },
      { kind: 'read', node: 'A', client: 'alice' },
      { kind: 'read', node: 'B', client: 'bob' },
    ],
    average = consistencySchema.parse({ operations });
  return {
    id: slug,
    maxSize: 24,
    measureSize: (input) => input.operations.length,
    inputHint:
      'Operations are reads/writes on replicas A/B. Strong mode requires both replicas; eventual mode serves locally; session mode waits rather than violating its client’s observed version. delay controls async delivery. partitionAt/healAt are operation indices; -1 disables the event.',
    controls: [
      {
        key: 'mode',
        label: 'Consistency policy',
        type: 'select',
        options: [
          { value: 'strong', label: 'Strong / wait for both' },
          { value: 'eventual', label: 'Eventual / local availability' },
          { value: 'session', label: 'Session monotonic reads' },
        ],
      },
      {
        key: 'delay',
        label: 'Async delivery delay',
        type: 'number',
        min: 0,
        max: 8,
      },
      {
        key: 'partitionAt',
        label: 'Partition operation (-1 = none)',
        type: 'number',
        min: -1,
        max: 23,
      },
      {
        key: 'healAt',
        label: 'Heal operation (-1 = never)',
        type: 'number',
        min: -1,
        max: 24,
      },
    ],
    presetLabels: {
      best: 'Connected strong writes',
      average: 'Delayed eventual reads',
      worst: 'Partition and conflicting writes',
    },
    presets: {
      best: consistencySchema.parse({ operations, mode: 'strong', delay: 0 }),
      average,
      worst: consistencySchema.parse({
        operations: [
          { kind: 'write', node: 'A', client: 'alice', value: 1 },
          { kind: 'write', node: 'B', client: 'bob', value: 2 },
          { kind: 'read', node: 'A', client: 'alice' },
          { kind: 'read', node: 'B', client: 'bob' },
        ],
        partitionAt: 0,
        healAt: -1,
      }),
      random: (n) =>
        consistencySchema.parse({
          operations: Array.from(
            { length: Math.min(24, Math.max(1, n)) },
            (_, i) =>
              i % 3 === 0
                ? {
                    kind: 'write',
                    node: i % 2 ? 'B' : 'A',
                    client: 'client',
                    value: i,
                  }
                : { kind: 'read', node: i % 2 ? 'B' : 'A', client: 'client' },
          ),
        }),
    },
    validateInput: (raw) => consistencySchema.parse(raw),
    complexity: {
      metric: {
        label: 'Read/write operations attempted',
        keys: ['operations'],
      },
      best: 'Connected strong model: acknowledgment waits for both replicas',
      average:
        'Eventual/session model: local responses can precede replication',
      worst: 'Partition forces a consistency/availability trade-off',
      space: 'O(operations) pending messages and history',
      why: 'CAP concerns behavior during a network partition: this two-replica strong policy rejects operations without both replicas, while eventual policy serves local state that can diverge. Without a partition, synchronous coordination still adds modeled latency (PACELC). Session tokens enforce only the modeled client’s read-your-writes and monotonic-version requirements; they are not global linearizability.',
    },
    *generate(input) {
      type Version = { counter: number; node: 'A' | 'B'; value: number };
      const replicas: Record<'A' | 'B', Version> = {
          A: { counter: 0, node: 'A', value: 0 },
          B: { counter: 0, node: 'A', value: 0 },
        },
        pending: { due: number; to: 'A' | 'B'; version: Version }[] = [],
        sessions = new Map<string, Version>(),
        history: {
          operation: number;
          node: 'A' | 'B';
          kind: 'read' | 'write';
          available: boolean;
          value: number | null;
          version: string | null;
          modeledLatency: number;
        }[] = [],
        c = counters();
      const compare = (a: Version, b: Version) =>
          a.counter - b.counter ||
          (a.node < b.node ? -1 : a.node > b.node ? 1 : 0),
        version = (v: Version) => `${v.counter}:${v.node}`;
      let healed = false;
      function partitioned(t: number) {
        return (
          input.partitionAt >= 0 &&
          t >= input.partitionAt &&
          (input.healAt === -1 || t < input.healAt)
        );
      }
      function scene(t: number): VisualState {
        return {
          kind: 'architecture',
          values: [replicas.A.value, replicas.B.value],
          nodes: [
            { id: 'client', label: 'Clients + session tokens', x: 0, y: 100 },
            {
              id: 'A',
              label: `Replica A = ${replicas.A.value} (${version(replicas.A)})`,
              x: 240,
              y: 20,
            },
            {
              id: 'B',
              label: `Replica B = ${replicas.B.value} (${version(replicas.B)})`,
              x: 240,
              y: 190,
            },
          ],
          edges: [
            { from: 'client', to: 'A' },
            { from: 'client', to: 'B' },
            {
              from: 'A',
              to: 'B',
              label: partitioned(t) ? 'partition' : 'replicate',
            },
            {
              from: 'B',
              to: 'A',
              label: partitioned(t) ? 'partition' : 'replicate',
            },
          ],
        };
      }
      function emit(
        text: string,
        line: number,
        t: number,
        vars: Frame['variables'] = {},
        marks: Frame['highlights'] = [],
        action?: Frame['action'],
      ) {
        return frame(
          scene(t),
          text,
          c,
          line,
          {
            mode: input.mode,
            partition: partitioned(t),
            pending: pending.length,
            ...vars,
          },
          marks,
          action,
        );
      }
      yield emit(
        'State the guarantee before judging a stale or unavailable response.',
        1,
        0,
      );
      for (let t = 0; t < input.operations.length; t++) {
        const partition = partitioned(t);
        if (
          !partition &&
          input.partitionAt >= 0 &&
          input.healAt >= 0 &&
          t >= input.healAt &&
          !healed
        ) {
          const winner =
            compare(replicas.A, replicas.B) >= 0 ? replicas.A : replicas.B;
          replicas.A = { ...winner };
          replicas.B = { ...winner };
          healed = true;
          c.writes += 2;
          yield emit(
            'Healing converges conflicting values using the declared logical-version tie rule.',
            4,
            t,
            { winner: version(winner) },
          );
        }
        if (!partition)
          for (let i = pending.length - 1; i >= 0; i--)
            if (pending[i].due <= t) {
              const message = pending.splice(i, 1)[0];
              if (compare(message.version, replicas[message.to]) > 0) {
                replicas[message.to] = { ...message.version };
                c.writes++;
              }
              c.messages = (c.messages ?? 0) + 1;
            }
        const op = input.operations[t],
          other = op.node === 'A' ? 'B' : 'A',
          token = sessions.get(op.client);
        c.operations = (c.operations ?? 0) + 1;
        let available = true,
          value: number | null = null,
          observed: Version | null = null,
          latency = 1;
        if (input.mode === 'strong' && partition) {
          available = false;
          yield emit(
            'Strong mode cannot acknowledge an operation without its required replica agreement.',
            3,
            t,
            { client: op.client, node: op.node },
            [{ id: 'A->B', kind: 'error' }],
            {
              prompt:
                'Can this strong two-replica policy remain available during this partition?',
              choices: ['No; reject or wait', 'Yes; acknowledge independently'],
              answer: 'No; reject or wait',
              hint: 'Acknowledging conflicting local operations would abandon the declared strong agreement requirement.',
            },
          );
        } else if (
          input.mode === 'session' &&
          token &&
          compare(replicas[op.node], token) < 0
        ) {
          available = false;
          yield emit(
            'This replica is behind the client session; wait before reading or writing.',
            3,
            t,
            {
              client: op.client,
              required: version(token),
              local: version(replicas[op.node]),
            },
            [{ id: op.node, kind: 'queued' }],
          );
        } else if (op.kind === 'write') {
          const local = replicas[op.node],
            next = {
              counter: local.counter + 1,
              node: op.node,
              value: op.value!,
            };
          replicas[op.node] = next;
          observed = next;
          value = next.value;
          c.writes++;
          sessions.set(op.client, { ...next });
          if (input.mode === 'strong' || (input.delay === 0 && !partition)) {
            replicas[other] = { ...next };
            if (input.mode === 'strong') latency += input.delay;
            c.writes++;
          } else
            pending.push({
              due: t + Math.max(1, input.delay),
              to: other,
              version: { ...next },
            });
          yield emit(
            'A local write advances this replica’s logical version.',
            3,
            t,
            {
              node: op.node,
              value,
              version: version(next),
              modeledLatency: latency,
            },
            [{ id: op.node, kind: 'moving' }],
          );
        } else {
          const local = replicas[op.node];
          if (input.mode === 'session' && token && compare(local, token) < 0) {
            available = false;
            yield emit(
              'This replica is behind the client’s session token; wait rather than return an older version.',
              3,
              t,
              {
                client: op.client,
                required: version(token),
                local: version(local),
              },
              [{ id: op.node, kind: 'queued' }],
            );
          } else {
            value = local.value;
            observed = { ...local };
            c.reads++;
            if (!token || compare(local, token) > 0)
              sessions.set(op.client, { ...local });
            yield emit(
              'Return the local version only if the selected policy permits it.',
              3,
              t,
              {
                client: op.client,
                node: op.node,
                value,
                version: version(local),
              },
              [{ id: op.node, kind: 'visited' }],
              {
                prompt:
                  'Does an available eventual read prove it saw the latest remote write?',
                choices: ['No', 'Yes'],
                answer: 'No',
                hint: 'A remote update can still be delayed or partitioned.',
              },
            );
          }
        }
        history.push({
          operation: t,
          node: op.node,
          kind: op.kind,
          available,
          value,
          version: observed ? version(observed) : null,
          modeledLatency: available ? latency : 0,
        });
        yield emit(
          'Record both successful responses and explicit unavailability.',
          5,
          t,
          { available, value },
        );
      }
      const f = emit(
        'Convergence, session guarantees and global agreement answer different questions.',
        6,
        input.operations.length - 1,
      );
      f.state.result = {
        replicas,
        history,
        pending: pending.length,
        converged:
          version(replicas.A) === version(replicas.B) &&
          replicas.A.value === replicas.B.value,
        versionRule:
          'Lamport counter then replica ID; not a physical-time recency guarantee',
      };
      yield f;
    },
  };
}
const availabilitySchema = z
  .object({
    components: z.array(z.number().min(0).max(1)).min(1).max(8),
    topology: z.enum(['series', 'parallel']).default('series'),
    commonAvailability: z.number().min(0).max(1).default(1),
    days: z.number().int().min(1).max(366).default(30),
  })
  .strict();
export const availability: Visualizer<z.infer<typeof availabilitySchema>> = {
  id: 'availability-the-nines',
  maxSize: 8,
  measureSize: (input) => input.components.length,
  inputHint:
    'Use {"components":[0.999,0.999],"topology":"series","commonAvailability":1,"days":30}. Component probabilities are assumed independent except for the explicit common failure factor.',
  controls: [
    {
      key: 'topology',
      label: 'Dependency topology',
      type: 'select',
      options: [
        { value: 'series', label: 'Every component required' },
        { value: 'parallel', label: 'Any one replica sufficient' },
      ],
    },
    {
      key: 'commonAvailability',
      label: 'Common failure-domain availability',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.0001,
    },
  ],
  presets: {
    best: {
      components: [0.999, 0.999],
      topology: 'parallel',
      commonAvailability: 1,
      days: 30,
    },
    average: {
      components: [0.999, 0.999],
      topology: 'series',
      commonAvailability: 1,
      days: 30,
    },
    worst: {
      components: [0.9999, 0.9999],
      topology: 'parallel',
      commonAvailability: 0.99,
      days: 30,
    },
    random: (n) => ({
      components: Array(Math.min(8, n)).fill(0.999) as number[],
      topology: 'series',
      commonAvailability: 1,
      days: 30,
    }),
  },
  validateInput: (raw) => availabilitySchema.parse(raw),
  complexity: {
    metric: { label: 'Component probability terms', keys: ['terms'] },
    best: 'Independent redundant replicas multiply failure probabilities',
    average: 'Required serial dependencies multiply success probabilities',
    worst: 'A shared failure domain limits redundancy gains',
    space: 'O(k) displayed components',
    why: 'For independent series dependencies A=∏Aᵢ; for independent parallel replicas A=1−∏(1−Aᵢ). Multiply by the declared common availability factor. Real failure correlation, recovery behavior, failover delay and workload can invalidate independence; these are planning equations, not an SLA promise.',
  },
  *generate(input) {
    const c = counters();
    let product = 1;
    const scene: VisualState = {
      kind: 'architecture',
      values: input.components,
      nodes: [
        { id: 'client', label: 'Client', x: 0, y: 80 },
        ...input.components.map((p, i) => ({
          id: String(i),
          label: `${(p * 100).toFixed(4)}%`,
          x: input.topology === 'series' ? 200 + i * 180 : 220,
          y: input.topology === 'series' ? 80 : i * 100,
        })),
        {
          id: 'common',
          label: `Shared domain ${(input.commonAvailability * 100).toFixed(3)}%`,
          x: 0,
          y: 230,
        },
      ],
      edges: input.components.map((_, i) => ({
        from: input.topology === 'series' && i > 0 ? String(i - 1) : 'client',
        to: String(i),
      })),
    };
    yield frame(
      scene,
      'State topology and independence assumptions before multiplying availability.',
      c,
      1,
      { topology: input.topology },
    );
    for (let i = 0; i < input.components.length; i++) {
      product *=
        input.topology === 'series'
          ? input.components[i]
          : 1 - input.components[i];
      c.terms = (c.terms ?? 0) + 1;
      yield frame(
        scene,
        'Accumulate success probabilities for series or failure probabilities for parallel.',
        c,
        3,
        { index: i, product },
        [{ id: String(i), kind: 'comparing' }],
        {
          prompt: 'Does sharing one failure domain preserve full independence?',
          choices: ['No', 'Yes'],
          answer: 'No',
          hint: 'A common outage can disable every replica at once.',
        },
      );
    }
    const a =
        (input.topology === 'series' ? product : 1 - product) *
        input.commonAvailability,
      downtime = (1 - a) * input.days * 86400,
      nines = a === 1 ? null : Math.max(0, -Math.log10(1 - a));
    yield frame(
      {
        ...scene,
        result: {
          availability: a,
          percent: a * 100,
          expectedDowntimeSeconds: downtime,
          nines,
          periodDays: input.days,
          assumesIndependentComponents: true,
        },
      },
      'Redundancy helps only to the extent that its failures and recovery paths are independent.',
      c,
      6,
      { availability: a, expectedDowntimeSeconds: downtime, nines },
    );
  },
};
