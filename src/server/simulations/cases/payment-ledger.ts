import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const schema = z
  .object({
    amount: z.number().int().min(1).max(100000).default(19900),
    currency: z.enum(['INR', 'USD']).default('INR'),
    events: z
      .array(
        z.object({
          id: z.string().min(1).max(24),
          kind: z.enum(['capture', 'failure', 'refund']),
          amount: z.number().int().min(1).max(100000),
          currency: z.enum(['INR', 'USD']).default('INR'),
        }),
      )
      .min(1)
      .max(32),
  })
  .strict();
export const paymentLedger: Visualizer<z.infer<typeof schema>> = {
  id: 'payment-system-design',
  maxSize: 32,
  measureSize: (p) => p.events.length,
  inputHint:
    'Offline state machine for one order. Events are assumed already authenticated by a trusted provider adapter; this model does not verify webhooks or charge money. Integer minor units, exact currency/amount capture checks, event-ID deduplication, cumulative refunds and a balanced double-entry ledger. Any refund revokes this example entitlement.',
  controls: [
    {
      key: 'amount',
      label: 'Order amount in minor units',
      type: 'number',
      min: 1,
      max: 100000,
    },
  ],
  presets: {
    best: schema.parse({
      events: [{ id: 'e1', kind: 'capture', amount: 19900 }],
    }),
    average: schema.parse({
      events: [
        { id: 'e1', kind: 'capture', amount: 19900 },
        { id: 'e1', kind: 'capture', amount: 19900 },
        { id: 'e2', kind: 'failure', amount: 19900 },
        { id: 'r1', kind: 'refund', amount: 5000 },
        { id: 'e3', kind: 'capture', amount: 19900 },
      ],
    }),
    worst: schema.parse({
      events: [
        { id: 'r1', kind: 'refund', amount: 19900 },
        { id: 'e1', kind: 'capture', amount: 1 },
        { id: 'e2', kind: 'capture', amount: 19900 },
        { id: 'r2', kind: 'refund', amount: 20000 },
      ],
    }),
    random: (n) =>
      schema.parse({
        events: Array.from(
          { length: Math.min(32, Math.max(1, n)) },
          (_, i) => ({
            id: `e${i}`,
            kind: i === 0 ? 'capture' : 'failure',
            amount: 19900,
          }),
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'O(1) indexed event replay',
    average: 'O(E) events with indexed identities',
    worst: 'O(E) event and ledger retention',
    space: 'O(E)',
    why: 'All transitions and ledger writes model one atomic local database transaction. Refund-before-capture stays retryable until reconciliation; external settlements require a separate reconciliation process.',
    metric: { label: 'Accepted transitions', keys: ['transitions'] },
  },
  *generate(p) {
    let state:
        'created' | 'failed' | 'captured' | 'partially-refunded' | 'refunded' =
        'created',
      captured = 0,
      refunded = 0;
    const seen = new Map<string, string>(),
      ledger: { event: string; account: string; delta: number }[] = [],
      history: {
        id: string;
        kind: string;
        status: string;
        state: string;
        captured: number;
        refunded: number;
        entitled: boolean;
      }[] = [],
      c = counters();
    c.transitions = 0;
    c.replays = 0;
    c.conflicts = 0;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'order', label: 'Order: immutable price', x: 0, y: 100 },
        { id: 'inbox', label: 'Authenticated event inbox', x: 230, y: 100 },
        { id: 'transaction', label: 'Atomic state + ledger', x: 460, y: 100 },
        { id: 'outbox', label: 'Entitlement + receipt outbox', x: 690, y: 100 },
      ],
      edges: [
        { from: 'order', to: 'inbox' },
        { from: 'inbox', to: 'transaction' },
        { from: 'transaction', to: 'outbox' },
      ],
    };
    yield frame(
      scene,
      'Create the order at a server-owned price; trust begins only after provider authentication.',
      c,
      1,
    );
    for (const event of p.events) {
      const payload = JSON.stringify([
          event.kind,
          event.amount,
          event.currency,
        ]),
        previous = seen.get(event.id);
      let status = '';
      const eligible =
        event.currency === p.currency &&
        (event.kind === 'capture'
          ? event.amount === p.amount && captured === 0
          : event.kind === 'refund'
            ? captured > 0 && event.amount <= captured - refunded
            : true);
      yield frame(
        scene,
        'Inspect event identity and current durable state before applying an atomic transition.',
        c,
        2,
        { event: event.id, state, captured, refunded },
        [],
        {
          prompt: 'What happens next to this event?',
          choices: [
            'Replay prior result',
            'Reject changed event identity',
            'Reject or defer invalid transition',
            'Apply eligible transition',
          ],
          answer:
            previous !== undefined
              ? previous === payload
                ? 'Replay prior result'
                : 'Reject changed event identity'
              : eligible
                ? 'Apply eligible transition'
                : 'Reject or defer invalid transition',
          hint: 'Check deduplication first, then currency, captured amount and remaining refundable balance.',
        },
      );
      if (previous !== undefined) {
        if (previous === payload) {
          status = 'replayed';
          c.replays++;
        } else {
          status = 'event-conflict';
          c.conflicts++;
        }
      } else if (event.currency !== p.currency) status = 'currency-mismatch';
      else if (event.kind === 'capture') {
        if (event.amount !== p.amount) status = 'amount-mismatch';
        else if (captured > 0) {
          status = 'already-captured';
          seen.set(event.id, payload);
        } else {
          captured = event.amount;
          state = 'captured';
          ledger.push(
            { event: event.id, account: 'provider-clearing', delta: captured },
            {
              event: event.id,
              account: 'customer-liability',
              delta: -captured,
            },
          );
          status = 'captured';
          seen.set(event.id, payload);
          c.transitions++;
          c.writes += 4;
        }
      } else if (event.kind === 'refund') {
        if (captured === 0) status = 'deferred-await-capture';
        else if (event.amount > captured - refunded)
          status = 'exceeds-refundable';
        else {
          refunded += event.amount;
          state = refunded === captured ? 'refunded' : 'partially-refunded';
          ledger.push(
            {
              event: event.id,
              account: 'provider-clearing',
              delta: -event.amount,
            },
            {
              event: event.id,
              account: 'customer-liability',
              delta: event.amount,
            },
          );
          status = 'refunded';
          seen.set(event.id, payload);
          c.transitions++;
          c.writes += 4;
        }
      } else {
        if (captured === 0) {
          state = 'failed';
          status = 'failed';
          c.transitions++;
        } else status = 'ignored-late-failure';
        seen.set(event.id, payload);
      }
      history.push({
        id: event.id,
        kind: event.kind,
        status,
        state,
        captured,
        refunded,
        entitled: captured > 0 && refunded === 0,
      });
      yield frame(
        scene,
        'Persist the outcome without allowing delayed failures or captures to undo refund state.',
        c,
        5,
        { state, status, captured, refunded },
        [
          {
            id: 'transaction',
            kind:
              status.includes('mismatch') || status.includes('exceeds')
                ? 'error'
                : 'visited',
          },
        ],
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          state,
          captured,
          refunded,
          entitled: captured > 0 && refunded === 0,
          ledger,
          ledgerBalance: ledger.reduce((s, e) => s + e.delta, 0),
          history,
        },
      },
      'Every accepted monetary effect has equal and opposite ledger entries; actual settlement still needs provider reconciliation.',
      c,
      6,
    );
  },
};
