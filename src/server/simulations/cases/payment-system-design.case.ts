import 'server-only';
import { withCaseStudy } from './overview';
import { paymentLedger } from './payment-ledger';
export default withCaseStudy(paymentLedger, {
  requirements: [
    'Use server-owned integer prices and exact currency checks.',
    'Apply authenticated provider events idempotently with balanced ledger entries.',
    'Prevent late events and excessive refunds from restoring invalid access.',
  ],
  apis: [
    {
      method: 'POST',
      path: '/orders',
      purpose: 'Create an order from a server-owned product price.',
    },
    {
      method: 'POST',
      path: '/provider-events',
      purpose: 'Authenticate provider events before transactional processing.',
    },
    {
      method: 'POST',
      path: '/orders/{id}/refunds',
      purpose: 'Request a bounded authenticated refund.',
    },
  ],
  entities: [
    {
      name: 'Order',
      fields: 'orderId PK, amountMinor, currency, state, captured, refunded',
    },
    {
      name: 'ProviderEvent',
      fields: 'provider + eventId UNIQUE, payloadHash, processedAt',
    },
    {
      name: 'LedgerEntry',
      fields: 'entryId PK, eventId, account, signedAmountMinor',
    },
  ],
  decisions: [
    'Create immutable order terms before contacting a provider.',
    'Authenticate transport before trusting event fields.',
    'Deduplicate event identities and reject changed payloads.',
    'Atomically persist valid state, balanced ledger effects and durable outbox work.',
    'Reconcile out-of-order events and uncertain provider outcomes without inventing success.',
  ],
  breakInstructions:
    'Replay capture events, change a payload under the same event ID, refund twice and send late failure/capture events. The ledger must balance and refunded access must remain revoked.',
  assumptions: {
    dailyActors: 100000,
    requestsPerActor: 20,
    peakMultiplier: 5,
    payloadBytes: 1000,
    retentionDays: 30,
  },
});
