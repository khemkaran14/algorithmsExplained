import 'server-only';
import { withCaseStudy } from './overview';
import { webCrawler } from './search-dispatch';
export default withCaseStudy(webCrawler, {
  requirements: [
    'Deduplicate canonical URLs in a bounded crawl frontier.',
    'Respect modeled host policies and per-host delays.',
    'Expose unfinished work and avoid making real network calls in this exercise.',
  ],
  apis: [
    {
      method: 'POST',
      path: '/crawl-jobs',
      purpose: 'Create an offline example crawl with seed URLs.',
    },
    {
      method: 'GET',
      path: '/crawl-jobs/{id}',
      purpose: 'Inspect visited, blocked, failed and pending URLs.',
    },
  ],
  entities: [
    {
      name: 'FrontierItem',
      fields: 'canonicalUrl UNIQUE, state, discoveredAt',
    },
    {
      name: 'HostPolicy',
      fields: 'hostname PK, nextEligibleTick, blockedPrefixes',
    },
  ],
  decisions: [
    'A frontier tracks discovered URL identity before issuing work.',
    'Canonical fragment removal prevents repeated fetches of the same document.',
    'Policy checks happen before consuming a fetch slot.',
    'Per-host scheduling allows other hosts to proceed during a cooldown.',
    'Extraction feeds unseen links back into the frontier and preserves accounting.',
  ],
  breakInstructions:
    'Increase workers without reducing per-host delay and observe the host limit. Disable robots respect to count policy violations; shorten the run to retain pending URLs.',
  assumptions: {
    dailyActors: 100000,
    requestsPerActor: 20,
    peakMultiplier: 5,
    payloadBytes: 1000,
    retentionDays: 30,
  },
});
