import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
import { Fifo } from '../collections';
const schema = z
  .object({
    mode: z.enum(['normalized', 'denormalized']).default('denormalized'),
    atomicFanout: z.boolean().default(false),
    asyncFanout: z.boolean().default(false),
    workerDown: z.boolean().default(false),
    workerBudget: z.number().int().min(1).max(8).default(1),
    failAfterCopies: z.number().int().min(-1).max(16).default(-1),
    customers: z
      .array(
        z.object({
          id: z.number().int().min(0).max(99),
          address: z.string().min(1).max(32),
        }),
      )
      .min(1)
      .max(8),
    orders: z
      .array(
        z.object({
          id: z.number().int().min(0).max(99),
          customerId: z.number().int().min(0).max(99),
        }),
      )
      .min(1)
      .max(16),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({
            kind: z.literal('update'),
            customerId: z.number().int().min(0).max(99),
            address: z.string().min(1).max(32),
          }),
          z.object({
            kind: z.literal('read'),
            orderId: z.number().int().min(0).max(99),
          }),
          z.object({ kind: z.literal('repair') }),
          z.object({ kind: z.literal('tick') }),
        ]),
      )
      .min(1)
      .max(24),
  })
  .strict()
  .superRefine((p, ctx) => {
    const ids = new Set(p.customers.map((c) => c.id));
    if (
      ids.size !== p.customers.length ||
      new Set(p.orders.map((o) => o.id)).size !== p.orders.length
    )
      ctx.addIssue({ code: 'custom', message: 'Entity IDs must be distinct.' });
    if (
      p.orders.some((o) => !ids.has(o.customerId)) ||
      p.operations.some(
        (o) =>
          (o.kind === 'update' && !ids.has(o.customerId)) ||
          (o.kind === 'read' && !p.orders.some((row) => row.id === o.orderId)),
      )
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Every operation and order must reference an existing entity.',
      });
    if (p.atomicFanout && p.asyncFanout)
      ctx.addIssue({
        code: 'custom',
        message:
          'Choose synchronous atomic fan-out or asynchronous propagation.',
      });
  });
const data = {
  customers: [{ id: 1, address: 'Old Street' }],
  orders: [
    { id: 1, customerId: 1 },
    { id: 2, customerId: 1 },
    { id: 3, customerId: 1 },
  ],
};
export const denormalization: Visualizer<z.infer<typeof schema>> = {
  id: 'denormalization-trade-offs',
  maxSize: 24,
  measureSize: (p) => p.operations.length,
  inputHint:
    'Orders hold a duplicate of the current customer address in denormalized mode. This is explicitly a current-profile cache, not an immutable historical shipping address. Normalize to read the authoritative customer at query time, or propagate updates to duplicate fields. Synchronous atomic fan-out rolls back a failed update; split writes can leave stale copies; asynchronous propagation uses a durable-intent assumption and bounded workers. Repair rebuilds copies from current truth.',
  controls: [
    {
      key: 'mode',
      label: 'Read model',
      type: 'select',
      options: ['normalized', 'denormalized'].map((value) => ({
        value,
        label: value,
      })),
    },
    {
      key: 'atomicFanout',
      label: 'Atomic synchronous update',
      type: 'boolean',
    },
    {
      key: 'asyncFanout',
      label: 'Durable asynchronous fan-out',
      type: 'boolean',
    },
    {
      key: 'workerDown',
      label: 'Propagation worker unavailable',
      type: 'boolean',
    },
    {
      key: 'failAfterCopies',
      label: 'Fail sync update after copies (-1 = none)',
      type: 'number',
      min: -1,
      max: 16,
    },
  ],
  presets: {
    best: schema.parse({
      ...data,
      atomicFanout: true,
      operations: [
        { kind: 'update', customerId: 1, address: 'New Road' },
        { kind: 'read', orderId: 2 },
      ],
    }),
    average: schema.parse({
      ...data,
      failAfterCopies: 1,
      operations: [
        { kind: 'update', customerId: 1, address: 'New Road' },
        { kind: 'read', orderId: 1 },
        { kind: 'read', orderId: 2 },
        { kind: 'repair' },
        { kind: 'read', orderId: 2 },
      ],
    }),
    worst: schema.parse({
      ...data,
      asyncFanout: true,
      workerDown: true,
      operations: [
        { kind: 'update', customerId: 1, address: 'New Road' },
        { kind: 'read', orderId: 2 },
      ],
    }),
    random: (n) =>
      schema.parse({
        ...data,
        operations: Array.from(
          { length: Math.min(24, Math.max(1, n)) },
          (_, i) =>
            i === 0
              ? { kind: 'update', customerId: 1, address: 'New Road' }
              : { kind: 'read', orderId: 1 + (i % 3) },
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'Normalized update touches one authoritative row',
    average: 'Denormalized update fans out to K duplicate copies',
    worst:
      'O(K) repair and propagation work; stale reads remain possible while work is pending',
    space: 'O(customers + orders + queued copy tasks)',
    why: 'The read model trades extra storage/write amplification against avoiding a join. Historical snapshots are a different domain rule and should not be rewritten as current-profile caches.',
    metric: { label: 'Model row writes', keys: ['writes'] },
  },
  *generate(p) {
    const customers = new Map(p.customers.map((c) => [c.id, c.address])),
      orders = p.orders.map((o) => ({
        ...o,
        address: customers.get(o.customerId)!,
      })),
      queue = new Fifo<{ orderId: number; address: string }>(),
      reads: {
        orderId: number;
        address: string;
        truth: string;
        stale: boolean;
      }[] = [],
      history: { step: number; outcome: string; pending: number }[] = [],
      c = counters();
    c.staleReads = 0;
    c.rollbacks = 0;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        {
          id: 'customer',
          label: 'Authoritative customer profile',
          x: 0,
          y: 100,
        },
        {
          id: 'orders',
          label: 'Order copies of current address',
          x: 270,
          y: 100,
        },
        { id: 'worker', label: 'Propagation / repair worker', x: 270, y: 250 },
        { id: 'read', label: 'Order read model', x: 530, y: 100 },
      ],
      edges: [
        { from: 'customer', to: 'orders', label: 'sync fan-out' },
        { from: 'customer', to: 'worker', label: 'durable intents' },
        { from: 'worker', to: 'orders' },
        { from: 'orders', to: 'read' },
        { from: 'customer', to: 'read', label: 'normalized join' },
      ],
    };
    yield frame(
      scene,
      'Choose whether the address means current profile data or a historical order fact before choosing a storage model.',
      c,
      1,
    );
    for (let step = 0; step < p.operations.length; step++) {
      if (!p.workerDown) {
        let budget = p.workerBudget;
        while (queue.length && budget--) {
          const task = queue.shift()!,
            row = orders.find((o) => o.id === task.orderId)!;
          row.address = task.address;
          c.writes++;
        }
      }
      const op = p.operations[step];
      let outcome = '';
      if (op.kind === 'update') {
        const targets = orders.filter((o) => o.customerId === op.customerId),
          willFail =
            p.mode === 'denormalized' &&
            !p.asyncFanout &&
            p.failAfterCopies >= 0 &&
            p.failAfterCopies < targets.length;
        yield frame(
          scene,
          'An atomic fan-out either updates all duplicated current fields or rolls back. Separate writes can leave mixed versions.',
          c,
          3,
          { copies: targets.length, willFail },
          [],
          {
            prompt:
              'Does this update require maintaining duplicate order fields?',
            choices: [
              'Yes, propagate or atomically update copies',
              'No, only authoritative profile row',
            ],
            answer:
              p.mode === 'denormalized'
                ? 'Yes, propagate or atomically update copies'
                : 'No, only authoritative profile row',
            hint: 'Read-time joins use the authoritative profile; duplicated current-profile fields require a maintenance policy.',
          },
        );
        if (willFail && p.atomicFanout) {
          c.rollbacks++;
          outcome = 'atomic-update-rolled-back';
        } else {
          customers.set(op.customerId, op.address);
          c.writes++;
          if (p.mode === 'normalized') outcome = 'authoritative-update';
          else if (p.asyncFanout) {
            for (const row of targets)
              queue.push({ orderId: row.id, address: op.address });
            outcome = 'propagation-enqueued';
          } else {
            let copied = 0;
            for (const row of targets) {
              if (willFail && copied >= p.failAfterCopies) break;
              row.address = op.address;
              c.writes++;
              copied++;
            }
            outcome = willFail ? 'partial-update-failed' : 'all-copies-updated';
          }
        }
      } else if (op.kind === 'read') {
        const row = orders.find((o) => o.id === op.orderId)!,
          truth = customers.get(row.customerId)!,
          address = p.mode === 'normalized' ? truth : row.address;
        c.reads += p.mode === 'normalized' ? 2 : 1;
        const stale = address !== truth;
        if (stale) c.staleReads++;
        reads.push({ orderId: row.id, address, truth, stale });
        outcome = stale ? 'stale-read' : 'current-read';
      } else if (op.kind === 'repair') {
        // Drain old intents before rebuilding; otherwise stale queued writes could overwrite the repair.
        while (queue.length) queue.shift();
        for (const row of orders) {
          row.address = customers.get(row.customerId)!;
          c.reads++;
          c.writes++;
        }
        outcome = 'rebuilt-current-copies';
      } else outcome = 'worker-tick';
      history.push({ step, outcome, pending: queue.length });
      yield frame(
        scene,
        'Account for copy writes, propagation lag and read freshness after this operation.',
        c,
        5,
        { step, outcome, pending: queue.length },
        [
          {
            id: outcome === 'stale-read' ? 'orders' : 'read',
            kind: outcome === 'stale-read' ? 'error' : 'visited',
          },
        ],
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          customers: Object.fromEntries(customers),
          orders,
          reads,
          pending: queue.length,
          staleReads: c.staleReads,
          rollbacks: c.rollbacks,
          history,
        },
      },
      'Denormalization needs a maintained consistency policy. Historical values, caches and authoritative facts have different semantics.',
      c,
      6,
    );
  },
};
