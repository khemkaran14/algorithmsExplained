import 'server-only';
import { withCaseStudy } from './overview';
import { notifications } from './notifications';
export default withCaseStudy(notifications, {
  requirements: [
    'Fan out one event independently to delivery channels.',
    'Retry transient failures and expose exhausted work in a dead-letter queue.',
    'Suppress repeated modeled application effects after a lost acknowledgment.',
  ],
  apis: [
    {
      method: 'POST',
      path: '/notifications',
      purpose: 'Accept a repeat-safe notification intent.',
    },
    {
      method: 'GET',
      path: '/notifications/{id}/status',
      purpose: 'Inspect each channel outcome and retry state.',
    },
  ],
  entities: [
    {
      name: 'Intent',
      fields:
        'notificationId PK, recipientId, templateVersion, payloadReference',
    },
    {
      name: 'Delivery',
      fields: 'notificationId + channel UNIQUE, attempts, status, providerKey',
    },
  ],
  decisions: [
    'Persist notification intent before asynchronous delivery.',
    'A broker creates an independent task for each channel subscription.',
    'Each channel has its own worker capacity and failure behavior.',
    'Atomic inbox state suppresses repeated local effects after redelivery.',
    'External delivery still needs provider idempotency and a reconciliation strategy.',
  ],
  breakInstructions:
    'Make SMS channel index 1 unavailable, lose an acknowledgment and inspect healthy-channel completion, duplicate suppression and dead-letter tasks.',
  assumptions: {
    dailyActors: 100000,
    requestsPerActor: 20,
    peakMultiplier: 5,
    payloadBytes: 1000,
    retentionDays: 30,
  },
});
