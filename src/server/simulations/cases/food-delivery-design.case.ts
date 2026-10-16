import 'server-only';
import { withCaseStudy } from './overview';
import { foodSaga } from './food-saga';
export default withCaseStudy(foodSaga, {
  requirements: [
    'Reserve inventory and a courier without double ownership.',
    'Compensate known payment failures in reverse order.',
    'Retain resources while a capture outcome awaits reconciliation.',
  ],
  apis: [
    {
      method: 'POST',
      path: '/orders',
      purpose: 'Start a repeat-safe order saga.',
    },
    {
      method: 'GET',
      path: '/orders/{id}',
      purpose: 'Return saga state, including pending reconciliation.',
    },
    {
      method: 'POST',
      path: '/reconciliation/{id}',
      purpose: 'Apply an authenticated provider outcome.',
    },
  ],
  entities: [
    {
      name: 'Saga',
      fields: 'orderId PK, state, stepVersion, paymentReference',
    },
    {
      name: 'Reservation',
      fields: 'resourceType + resourceId UNIQUE, orderId, status',
    },
  ],
  decisions: [
    'Persist saga state before asking independent services to act.',
    'Reserve inventory, then authorize payment and reserve a courier.',
    'Capture only after fulfillment resources have been secured.',
    'Known failures release courier, void authorization and release inventory in reverse order.',
    'An unknown capture keeps reservations until a trusted reconciliation result arrives.',
  ],
  breakInstructions:
    'Compare capture-failed with capture-uncertain. Leave reconciliation unknown, then resolve captured or failed; verify inventory and courier accounting in each result.',
  assumptions: {
    dailyActors: 100000,
    requestsPerActor: 20,
    peakMultiplier: 5,
    payloadBytes: 1000,
    retentionDays: 30,
  },
});
