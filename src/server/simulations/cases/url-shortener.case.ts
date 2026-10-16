import 'server-only';
import { withCaseStudy } from './overview';
import { urlShortener } from './content-delivery';
export default withCaseStudy(urlShortener, {
  requirements: [
    'Create unique short codes with repeat-safe writes.',
    'Resolve active links with low read latency.',
    'Define cache revocation and unavailable-store behavior.',
  ],
  apis: [
    {
      method: 'POST',
      path: '/links',
      purpose: 'Create using Idempotency-Key and a validated target URL.',
    },
    {
      method: 'GET',
      path: '/r/{code}',
      purpose: 'Resolve an active short code.',
    },
    {
      method: 'DELETE',
      path: '/links/{code}',
      purpose: 'Revoke an owned link and invalidate its cache entry.',
    },
  ],
  entities: [
    { name: 'Link', fields: 'code PK, targetUrl, active, ownerId, createdAt' },
    {
      name: 'RequestKey',
      fields: 'callerId + key UNIQUE, payloadHash, linkCode',
    },
  ],
  decisions: [
    'Start from unique, persistent code ownership before adding a cache.',
    'Keep API authorization and abuse protection separate from code allocation.',
    'A counter plus base62 is compact; a hash candidate still needs a uniqueness check.',
    'Cache reads save store round trips but invalidation affects revocation freshness.',
    'Retain a durable link record and never reuse a revoked code without an explicit policy.',
  ],
  breakInstructions:
    'Lose delete invalidation, resolve 001 after deletion, and compare the stale redirect with a correct invalidation. Reduce token length and compare sequential and collision-probed allocation.',
  assumptions: {
    dailyActors: 100000,
    requestsPerActor: 20,
    peakMultiplier: 5,
    payloadBytes: 1000,
    retentionDays: 30,
  },
});
