import 'server-only';
import { withCaseStudy } from './overview';
import { autocomplete } from './search-dispatch';
export default withCaseStudy(autocomplete, {
  requirements: [
    'Return exact prefix matches ranked by frequency and lexical ties.',
    'Bound suggestion count and distinguish lookup from ranking cost.',
    'Label degraded fallback results as stale and best effort.',
  ],
  apis: [
    {
      method: 'GET',
      path: '/suggest?q={prefix}&limit={k}',
      purpose: 'Return ranked prefix suggestions.',
    },
    {
      method: 'PUT',
      path: '/dictionary/{version}',
      purpose: 'Publish a versioned validated dictionary.',
    },
  ],
  entities: [
    { name: 'Term', fields: 'word UNIQUE, frequency, dictionaryVersion' },
    { name: 'TrieNode', fields: 'prefix, childEdges, optional terminalWord' },
  ],
  decisions: [
    'A versioned dictionary supplies explicit frequencies.',
    'A trie follows typed characters to the matching subtree.',
    'Enumerate and rank matches, or maintain top-k summaries in a larger system.',
    'Stable lexical ties make ranking deterministic.',
    'During an outage previous top-k filtering is only a stale best-effort subset.',
  ],
  breakInstructions:
    'Change frequencies to alter top-k order, then fail the service mid-prefix. Compare fallback with unavailable responses and explain why filtered prior results may omit valid suggestions.',
  assumptions: {
    dailyActors: 100000,
    requestsPerActor: 20,
    peakMultiplier: 5,
    payloadBytes: 1000,
    retentionDays: 30,
  },
});
