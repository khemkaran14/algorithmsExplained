import 'server-only';
import { withCaseStudy } from './overview';
import { rateLimiter } from '../rate-queue';
export default withCaseStudy(rateLimiter('rate-limiter-design'), {
  requirements: [
    'Apply per-client weighted request budgets.',
    'Choose burst and time-window semantics explicitly.',
    'Make admission and budget debit atomic in a real shared store.',
  ],
  apis: [
    {
      method: 'POST',
      path: '/admission/check',
      purpose: 'Admit or reject a client request with a weighted cost.',
    },
    {
      method: 'PUT',
      path: '/policies/{id}',
      purpose: 'Update an authenticated policy version.',
    },
  ],
  entities: [
    {
      name: 'Policy',
      fields: 'id, algorithm, capacity, windowMs, refillRate, version',
    },
    {
      name: 'ClientBudget',
      fields: 'policyId + clientKey, tokens or timestamp log, updatedAt',
    },
  ],
  decisions: [
    'Place the limiter before expensive application work.',
    'Partition state by authenticated client and policy.',
    'Token buckets allow bounded bursts while exact logs enforce a rolling window.',
    'Treat admission and budget debit as one atomic operation.',
    'Define fail-open or fail-closed behavior separately for each endpoint.',
  ],
  breakInstructions:
    'Send a burst on both sides of a window boundary, compare fixed windows and exact logs, then change request cost and refill rate.',
  assumptions: {
    dailyActors: 100000,
    requestsPerActor: 20,
    peakMultiplier: 5,
    payloadBytes: 1000,
    retentionDays: 30,
  },
});
