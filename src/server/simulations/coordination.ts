import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const electionSchema = z
  .object({
    groups: z.array(z.number().int().min(0).max(6)).min(3).max(7),
    fault: z.enum(['none', 'partition', 'crash']).default('partition'),
    faultAt: z.number().int().min(0).max(19).default(2),
    recoverAt: z.number().int().min(0).max(20).default(7),
    crashedNode: z.number().int().min(0).max(6).default(0),
    ticks: z.number().int().min(1).max(20).default(12),
    timeout: z.number().int().min(1).max(8).default(2),
    writesPerTick: z.number().int().min(0).max(8).default(1),
  })
  .strict();
export const leaderElection: Visualizer<z.infer<typeof electionSchema>> = {
  id: 'heartbeats-leader-election',
  maxSize: 7,
  measureSize: (p) => p.groups.length,
  inputHint:
    'groups defines each node’s partition group while fault=partition. The cluster size is odd (3,5,7). Initial leader is node 0. A majority is always computed from the full configured cluster. This is a quorum/fencing model, not an implementation of Raft.',
  controls: [
    {
      key: 'fault',
      label: 'Failure mode',
      type: 'select',
      options: ['none', 'partition', 'crash'].map((value) => ({
        value,
        label: value,
      })),
    },
    { key: 'faultAt', label: 'Failure tick', type: 'number', min: 0, max: 19 },
    {
      key: 'recoverAt',
      label: 'Recovery tick (0 = never)',
      type: 'number',
      min: 0,
      max: 20,
    },
    {
      key: 'timeout',
      label: 'Missing heartbeat timeout',
      type: 'number',
      min: 1,
      max: 8,
    },
  ],
  presets: {
    best: electionSchema.parse({ groups: [0, 0, 0], fault: 'none' }),
    average: electionSchema.parse({ groups: [0, 1, 1] }),
    worst: electionSchema.parse({ groups: [0, 1, 2], recoverAt: 0 }),
    random: (n) => {
      const count = n >= 5 ? 5 : 3;
      return electionSchema.parse({
        groups: Array.from({ length: count }, (_, i) => (i === 0 ? 0 : 1)),
      });
    },
  },
  validateInput(raw) {
    const p = electionSchema.parse(raw);
    if (p.groups.length % 2 !== 1 || p.crashedNode >= p.groups.length)
      throw new Error(
        'Use 3, 5 or 7 configured nodes and a valid crashed-node index.',
      );
    if (p.recoverAt !== 0 && p.recoverAt <= p.faultAt)
      throw new Error(
        'Recovery must follow the failure tick or be zero for no recovery.',
      );
    return p;
  },
  complexity: {
    metric: { label: 'Quorum-acknowledged writes', keys: ['commits'] },
    best: 'A healthy leader commits with a configured majority',
    average: 'Missing heartbeats delay a modeled re-election',
    worst: 'No connected majority means no acknowledged write',
    space: 'O(nodes+trace) state',
    why: 'A timeout suspects failure; it does not prove a node is dead. Only a connected configured majority may grant the modeled leadership and acknowledge writes. A higher observed term fences older leaders after healing. Real consensus additionally needs durable voting/log rules, log freshness and a complete network/recovery protocol, which this illustration does not implement.',
  },
  *generate(input) {
    const n = input.groups.length,
      quorum = Math.floor(n / 2) + 1,
      c = counters(),
      leaders = new Map<number, number>([[0, 1]]),
      missingSince = new Map<string, number>(),
      elections: {
        tick: number;
        term: number;
        leader: number;
        voters: number[];
      }[] = [],
      history: {
        tick: number;
        leaders: { node: number; term: number }[];
        committedBy: { node: number; term: number; votes: number }[];
        unavailableWrites: number;
      }[] = [];
    let term = 1;
    c.commits = 0;
    c.elections = 0;
    c.rejected = 0;
    function components(tick: number) {
      const fault =
          input.fault !== 'none' &&
          tick >= input.faultAt &&
          (input.recoverAt === 0 || tick < input.recoverAt),
        groups = new Map<number, number[]>();
      for (let node = 0; node < n; node++) {
        if (fault && input.fault === 'crash' && node === input.crashedNode)
          continue;
        const group =
          fault && input.fault === 'partition' ? input.groups[node] : 0;
        groups.set(group, [...(groups.get(group) ?? []), node]);
      }
      return [...groups.values()];
    }
    function scene(tick: number): VisualState {
      const groups = components(tick),
        online = new Set(groups.flat());
      return {
        kind: 'architecture',
        values: [],
        nodes: Array.from({ length: n }, (_, node) => ({
          id: String(node),
          label: `Node ${node}${leaders.has(node) ? ` · leader term ${leaders.get(node)}` : ''}${online.has(node) ? '' : ' · down'}`,
          x: 220 * (node % 3),
          y: 110 * Math.floor(node / 3),
        })),
        edges: groups.flatMap((group) =>
          group.flatMap((a) =>
            group
              .filter((b) => b > a)
              .map((b) => ({
                from: String(a),
                to: String(b),
                label: 'heartbeat/vote',
              })),
          ),
        ),
      };
    }
    yield frame(
      scene(0),
      'Initial leader term one still needs a majority to acknowledge a write.',
      c,
      1,
      { configuredNodes: n, quorum },
    );
    for (let tick = 0; tick < input.ticks; tick++) {
      const groups = components(tick),
        online = new Set(groups.flat()),
        committedBy: { node: number; term: number; votes: number }[] = [];
      for (const leader of leaders.keys())
        if (!online.has(leader)) leaders.delete(leader);
      for (const group of groups) {
        const key = group.join(','),
          known = group
            .filter((node) => leaders.has(node))
            .sort((a, b) => leaders.get(b)! - leaders.get(a)! || a - b);
        if (known.length > 1)
          for (const old of known.slice(1)) {
            leaders.delete(old);
            yield frame(
              scene(tick),
              'A connected node observing a higher leader term steps down.',
              c,
              4,
              { tick, node: old },
              [{ id: String(old), kind: 'queued' }],
            );
          }
        let leader = known[0];
        if (leader === undefined) {
          if (!missingSince.has(key)) missingSince.set(key, tick);
          if (
            group.length >= quorum &&
            tick - missingSince.get(key)! >= input.timeout
          ) {
            term++;
            leader = Math.min(...group);
            leaders.set(leader, term);
            elections.push({ tick, term, leader, voters: [...group] });
            c.elections++;
            missingSince.delete(key);
            yield frame(
              scene(tick),
              'A configured majority grants a new modeled term after the missing-heartbeat timeout.',
              c,
              3,
              { tick, leader, term, votes: group.length },
              [{ id: String(leader), kind: 'done' }],
              {
                prompt:
                  'May a minority independently acknowledge a leader’s writes?',
                choices: ['No', 'Yes'],
                answer: 'No',
                hint: 'A majority is based on the full configured cluster, not just the nodes currently reachable.',
              },
            );
          }
        } else missingSince.delete(key);
        if (leader !== undefined && group.length >= quorum) {
          committedBy.push({
            node: leader,
            term: leaders.get(leader)!,
            votes: group.length,
          });
          c.commits += input.writesPerTick;
        }
      }
      const unavailableWrites = committedBy.length ? 0 : input.writesPerTick;
      c.rejected += unavailableWrites;
      history.push({
        tick,
        leaders: [...leaders].map(([node, term]) => ({ node, term })),
        committedBy,
        unavailableWrites,
      });
      yield frame(
        scene(tick),
        committedBy.length
          ? 'Only the connected majority leader may acknowledge this tick’s writes.'
          : 'Without a connected majority leader, writes remain unavailable.',
        c,
        5,
        {
          tick,
          quorum,
          acknowledgingLeaders: committedBy.length,
          unavailableWrites,
        },
        committedBy.map((item) => ({ id: String(item.node), kind: 'visited' })),
      );
    }
    yield frame(
      {
        ...scene(input.ticks - 1),
        result: {
          quorum,
          elections,
          history,
          commits: c.commits,
          rejected: c.rejected,
          atMostOneQuorumWriter: history.every(
            (h) => h.committedBy.length <= 1,
          ),
          scope:
            'Abstract majority/heartbeat/fencing model; not a full consensus protocol',
        },
      },
      'A stale isolated leader can believe it leads without being able to commit.',
      c,
      6,
      { commits: c.commits, rejected: c.rejected },
    );
  },
};
const serviceSchema = z
  .object({
    mode: z.enum(['monolith', 'services']).default('monolith'),
    requests: z
      .array(z.enum(['catalog', 'checkout']))
      .min(1)
      .max(64),
    capacity: z.number().int().min(3).max(64).default(16),
    ticks: z.number().int().min(1).max(16).default(6),
    fault: z.enum(['none', 'payments']).default('none'),
    networkCost: z.number().int().min(0).max(100).default(5),
  })
  .strict();
export const serviceBoundaries: Visualizer<z.infer<typeof serviceSchema>> = {
  id: 'monolith-vs-microservices',
  maxSize: 64,
  measureSize: (p) => p.requests.length,
  inputHint:
    'Catalog requests need catalog only; checkout needs catalog, orders and payments. A payments crash takes down the whole modeled monolith, but only dependent routes in service mode. Capacity is a total compute budget, split across three services in services mode.',
  controls: [
    {
      key: 'mode',
      label: 'Service boundary',
      type: 'select',
      options: [
        { value: 'monolith', label: 'One process / shared failure' },
        { value: 'services', label: 'Three isolated services' },
      ],
    },
    {
      key: 'fault',
      label: 'Dependency failure',
      type: 'select',
      options: [
        { value: 'none', label: 'Healthy' },
        { value: 'payments', label: 'Payment process crashes' },
      ],
    },
    {
      key: 'networkCost',
      label: 'Modeled per-hop overhead',
      type: 'number',
      min: 0,
      max: 100,
    },
  ],
  presets: {
    best: serviceSchema.parse({
      requests: ['catalog', 'checkout'],
      mode: 'monolith',
    }),
    average: serviceSchema.parse({
      requests: ['catalog', 'catalog', 'checkout', 'checkout', 'catalog'],
      mode: 'services',
    }),
    worst: serviceSchema.parse({
      requests: ['catalog', 'checkout', 'catalog', 'checkout'],
      fault: 'payments',
    }),
    random: (n) =>
      serviceSchema.parse({
        requests: Array.from(
          { length: Math.min(64, Math.max(1, n)) },
          (_, i) => (i % 3 === 0 ? 'checkout' : 'catalog'),
        ),
      }),
  },
  validateInput: (raw) => serviceSchema.parse(raw),
  complexity: {
    metric: { label: 'Completed example requests', keys: ['completed'] },
    best: 'A monolith avoids internal network boundaries',
    average: 'Isolated services separate failure and capacity budgets',
    worst: 'A split alone adds overhead and can retain dependency bottlenecks',
    space: 'O(requests+service stages) queues',
    why: 'Service decomposition changes failure domains and operational overhead, not merely box count. This model holds total compute budget fixed: a monolith shares it, while services divide it across catalog/orders/payments. Checkout still depends on payment availability; catalog can remain available under isolated payment failure. It does not model every deployment, transaction or organizational trade-off.',
  },
  *generate(input) {
    const c = counters(),
      pending = input.requests.map((route, id) => ({ id, route, stage: 0 })),
      completed: number[] = [],
      failed: number[] = [],
      history: {
        tick: number;
        completed: number;
        failed: number;
        pending: number;
      }[] = [];
    c.completed = 0;
    c.failed = 0;
    c.hops = 0;
    let overhead = 0;
    function scene(): VisualState {
      return {
        kind: 'architecture',
        values: [],
        nodes: [
          { id: 'client', label: 'Client routes', x: 0, y: 100 },
          ...['catalog', 'orders', 'payments'].map((service, i) => ({
            id: service,
            label: `${input.mode === 'monolith' ? 'Monolith / ' : ''}${service}${input.fault === 'payments' && (service === 'payments' || input.mode === 'monolith') ? ' · down' : ''}`,
            x: 220 + i * 210,
            y: 100,
          })),
        ],
        edges: [
          { from: 'client', to: 'catalog' },
          { from: 'catalog', to: 'orders' },
          { from: 'orders', to: 'payments' },
        ],
      };
    }
    yield frame(
      scene(),
      'Compare failure isolation under a fixed total modeled compute budget.',
      c,
      1,
      { mode: input.mode, totalCapacity: input.capacity },
    );
    for (let tick = 0; tick < input.ticks; tick++) {
      if (input.mode === 'monolith') {
        let budget = input.capacity;
        for (let i = 0; i < pending.length && budget > 0;) {
          const request = pending[i],
            work = request.route === 'catalog' ? 1 : 3;
          if (input.fault === 'payments') {
            failed.push(request.id);
            pending.splice(i, 1);
            c.failed++;
            continue;
          }
          if (work > budget) {
            i++;
            continue;
          }
          budget -= work;
          completed.push(request.id);
          pending.splice(i, 1);
          c.completed++;
          c.hops++;
        }
      } else {
        const budgets = [
          Math.max(1, Math.floor(input.capacity / 3)),
          Math.floor(input.capacity / 3),
          input.capacity -
            Math.max(1, Math.floor(input.capacity / 3)) -
            Math.floor(input.capacity / 3),
        ];
        for (let stage = 2; stage >= 0; stage--)
          for (let i = 0; i < pending.length && budgets[stage] > 0;) {
            const request = pending[i];
            if (request.stage !== stage) {
              i++;
              continue;
            }
            budgets[stage]--;
            c.hops++;
            overhead += stage > 0 ? input.networkCost : 0;
            if (stage === 2 && input.fault === 'payments') {
              failed.push(request.id);
              pending.splice(i, 1);
              c.failed++;
              continue;
            }
            if (request.route === 'catalog' || stage === 2) {
              completed.push(request.id);
              pending.splice(i, 1);
              c.completed++;
            } else {
              request.stage++;
              i++;
            }
          }
      }
      history.push({
        tick,
        completed: completed.length,
        failed: failed.length,
        pending: pending.length,
      });
      yield frame(
        scene(),
        'Only routes depending on the failed isolated service must fail in service mode.',
        c,
        3,
        {
          tick,
          completed: completed.length,
          failed: failed.length,
          pending: pending.length,
        },
        [],
        {
          prompt:
            'Does splitting services remove checkout’s payment dependency?',
          choices: ['No', 'Yes'],
          answer: 'No',
          hint: 'A service boundary can isolate unrelated routes, but a route that still requires payment remains dependent on it.',
        },
      );
    }
    yield frame(
      {
        ...scene(),
        result: {
          completed,
          failed,
          pending: pending.map((p) => p.id),
          history,
          modeledNetworkOverhead: overhead,
          conserved:
            input.requests.length ===
            completed.length + failed.length + pending.length,
        },
      },
      'Separate dependency, failure isolation and per-boundary overhead in the design argument.',
      c,
      6,
      {
        completed: completed.length,
        failed: failed.length,
        pending: pending.length,
        modeledNetworkOverhead: overhead,
      },
    );
  },
};
