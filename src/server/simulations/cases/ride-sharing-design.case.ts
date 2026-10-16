import 'server-only';
import { withCaseStudy } from './overview';
import { rideSharing } from './search-dispatch';
export default withCaseStudy(rideSharing, {
  requirements: [
    'Find an available nearby driver with deterministic tie-breaking.',
    'Prevent concurrent requests from reserving the same driver.',
    'State the difference between Euclidean proximity and real route time.',
  ],
  apis: [
    {
      method: 'PUT',
      path: '/drivers/{id}/location',
      purpose: 'Update a timestamped driver location.',
    },
    {
      method: 'POST',
      path: '/rides',
      purpose: 'Find and atomically reserve a driver for a request.',
    },
  ],
  entities: [
    { name: 'Driver', fields: 'driverId PK, x, y, availability, version' },
    {
      name: 'Ride',
      fields: 'rideId PK, riderId, driverId, status, reservationVersion',
    },
  ],
  decisions: [
    'A location index narrows candidates while the reservation store owns availability.',
    'Spatial cells carry distance lower bounds for safe search pruning.',
    'Nearest lookup reads a snapshot and may race with another dispatcher.',
    'An atomic reservation retries a stale candidate against current availability.',
    'A production matcher additionally needs route estimates, fairness and expiring offers.',
  ],
  breakInstructions:
    'Use two riders near one driver with a shared batch snapshot. Disable atomic reservation to demonstrate double booking, then enable it and inspect the retry.',
  assumptions: {
    dailyActors: 100000,
    requestsPerActor: 20,
    peakMultiplier: 5,
    payloadBytes: 1000,
    retentionDays: 30,
  },
});
