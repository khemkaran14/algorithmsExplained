import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const schema = z
  .object({
    inventory: z.number().int().min(0).max(16).default(4),
    couriers: z.number().int().min(0).max(8).default(2),
    orders: z
      .array(
        z.object({
          id: z.string().min(1).max(20),
          fault: z
            .enum([
              'none',
              'authorization',
              'courier',
              'capture-failed',
              'capture-uncertain',
            ])
            .default('none'),
          reconcile: z
            .enum(['unknown', 'captured', 'failed'])
            .default('unknown'),
        }),
      )
      .min(1)
      .max(16),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (new Set(p.orders.map((o) => o.id)).size !== p.orders.length)
      ctx.addIssue({ code: 'custom', message: 'Order IDs must be distinct.' });
  });
export const foodSaga: Visualizer<z.infer<typeof schema>> = {
  id: 'food-delivery-design',
  maxSize: 16,
  measureSize: (p) => p.orders.length,
  inputHint:
    'Bounded staged saga: reserve one inventory item, authorize a payment hold, reserve one courier, capture, fulfill. Known failures compensate in reverse order. An uncertain capture retains resources until reconciliation. Local compensation is assumed reliable; real remote retries require idempotency and durable outboxes. Couriers are released after fulfillment in this compressed model.',
  controls: [
    {
      key: 'inventory',
      label: 'Inventory items',
      type: 'number',
      min: 0,
      max: 16,
    },
    {
      key: 'couriers',
      label: 'Available couriers',
      type: 'number',
      min: 0,
      max: 8,
    },
  ],
  presets: {
    best: schema.parse({ orders: [{ id: 'o1' }] }),
    average: schema.parse({
      orders: [
        { id: 'o1' },
        { id: 'o2', fault: 'authorization' },
        { id: 'o3', fault: 'capture-uncertain', reconcile: 'unknown' },
      ],
    }),
    worst: schema.parse({
      couriers: 0,
      orders: [{ id: 'o1' }, { id: 'o2', fault: 'capture-uncertain' }],
    }),
    random: (n) =>
      schema.parse({
        orders: Array.from(
          { length: Math.min(16, Math.max(1, n)) },
          (_, i) => ({
            id: `o${i}`,
            fault: i % 4 === 2 ? 'capture-uncertain' : 'none',
          }),
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'O(O) bounded local stages',
    average: 'O(O × S) for O orders and S saga stages',
    worst:
      'Unknown capture remains pending rather than inventing a safe rollback',
    space: 'O(O) durable saga records',
    why: 'This models ownership and compensation decisions, not a distributed transaction or a complete delivery service. Fair scheduling, real delivery time and failed compensation workers are outside its scope.',
    metric: { label: 'Saga state transitions', keys: ['transitions'] },
  },
  *generate(p) {
    const orders = p.orders.map((o) => ({
        ...o,
        state: 'new',
        reserved: false,
        hold: false,
        courier: null as number | null,
        captured: false,
      })),
      available = new Set(Array.from({ length: p.couriers }, (_, i) => i)),
      history: {
        order: string;
        state: string;
        inventory: number;
        freeCouriers: number;
      }[] = [],
      c = counters();
    let inventory = p.inventory,
      fulfilled = 0;
    c.transitions = 0;
    c.compensations = 0;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'saga', label: 'Durable order saga', x: 0, y: 100 },
        { id: 'inventory', label: 'Inventory reservations', x: 230, y: 0 },
        { id: 'payments', label: 'Authorization / capture', x: 230, y: 150 },
        { id: 'courier', label: 'Courier reservations', x: 470, y: 0 },
        {
          id: 'reconcile',
          label: 'Uncertain outcome reconciliation',
          x: 470,
          y: 180,
        },
      ],
      edges: [
        { from: 'saga', to: 'inventory' },
        { from: 'saga', to: 'payments' },
        { from: 'saga', to: 'courier' },
        { from: 'payments', to: 'reconcile' },
      ],
    };
    function compensate(o: (typeof orders)[number]) {
      if (o.courier !== null) {
        available.add(o.courier);
        o.courier = null;
        c.compensations++;
      }
      if (o.hold) {
        o.hold = false;
        c.compensations++;
      }
      if (o.reserved) {
        inventory++;
        o.reserved = false;
        c.compensations++;
      }
      o.state = 'compensated';
    }
    yield frame(
      scene,
      'Persist each saga transition and retain ownership while an external capture result is unknown.',
      c,
      1,
    );
    for (const stage of [
      'reserve',
      'authorize',
      'assign',
      'capture',
      'reconcile',
      'fulfill',
    ]) {
      for (const o of orders) {
        let changed = false;
        if (stage === 'reserve' && o.state === 'new') {
          if (inventory > 0) {
            inventory--;
            o.reserved = true;
            o.state = 'reserved';
          } else o.state = 'rejected-no-stock';
          changed = true;
        }
        if (stage === 'authorize' && o.state === 'reserved') {
          if (o.fault === 'authorization') compensate(o);
          else {
            o.hold = true;
            o.state = 'authorized';
          }
          changed = true;
        }
        if (stage === 'assign' && o.state === 'authorized') {
          if (o.fault === 'courier' || !available.size) compensate(o);
          else {
            o.courier = available.values().next().value!;
            available.delete(o.courier);
            o.state = 'assigned';
          }
          changed = true;
        }
        if (stage === 'capture' && o.state === 'assigned') {
          yield frame(
            scene,
            'Choose compensation only for a known failed capture; timeout is not proof of failure.',
            c,
            3,
            { order: o.id, outcome: o.fault },
            [],
            {
              prompt: 'What should the saga do after this capture outcome?',
              choices: [
                'Keep reservations and reconcile',
                'Compensate known failure',
                'Continue with confirmed capture',
              ],
              answer:
                o.fault === 'capture-uncertain'
                  ? 'Keep reservations and reconcile'
                  : o.fault === 'capture-failed'
                    ? 'Compensate known failure'
                    : 'Continue with confirmed capture',
              hint: 'Releasing inventory after an unknown charge can create paid orders with no fulfillment resources.',
            },
          );
          if (o.fault === 'capture-failed') compensate(o);
          else if (o.fault === 'capture-uncertain')
            o.state = 'awaiting-reconciliation';
          else {
            o.captured = true;
            o.hold = false;
            o.state = 'captured';
          }
          changed = true;
        }
        if (
          stage === 'reconcile' &&
          o.state === 'awaiting-reconciliation' &&
          o.reconcile !== 'unknown'
        ) {
          if (o.reconcile === 'failed') compensate(o);
          else {
            o.captured = true;
            o.hold = false;
            o.state = 'captured';
          }
          changed = true;
        }
        if (stage === 'fulfill' && o.state === 'captured') {
          o.state = 'fulfilled';
          o.reserved = false;
          fulfilled++;
          if (o.courier !== null) {
            available.add(o.courier);
            o.courier = null;
          }
          changed = true;
        }
        if (changed) {
          c.transitions++;
          c.writes++;
          history.push({
            order: o.id,
            state: o.state,
            inventory,
            freeCouriers: available.size,
          });
          yield frame(
            scene,
            'Record the state and resource ownership after this stage.',
            c,
            5,
            {
              order: o.id,
              state: o.state,
              inventory,
              freeCouriers: available.size,
            },
            [
              {
                id: stage === 'reconcile' ? 'reconcile' : 'saga',
                kind: o.state === 'compensated' ? 'error' : 'visited',
              },
            ],
          );
        }
      }
    }
    const reserved = orders.filter((o) => o.reserved).length,
      assigned = orders.filter((o) => o.courier !== null).length;
    yield frame(
      {
        ...scene,
        result: {
          orders,
          history,
          inventory,
          reserved,
          fulfilled,
          freeCouriers: available.size,
          assignedCouriers: assigned,
          inventoryConserved: inventory + reserved + fulfilled === p.inventory,
          couriersConserved: available.size + assigned === p.couriers,
          pendingReconciliation: orders.filter(
            (o) => o.state === 'awaiting-reconciliation',
          ).length,
          compensations: c.compensations,
        },
      },
      'A pending reconciliation is an explicit business state with retained resources, not a successful rollback.',
      c,
      6,
    );
  },
};
