import 'server-only';
import { withCaseStudy } from './overview';
import { newsFeed } from './social';
export default withCaseStudy(newsFeed, {
  requirements: [
    'Show a user posts from followed authors and themselves.',
    'Compare fan-out write amplification with read work.',
    'Make delayed delivery visible rather than claiming immediate consistency.',
  ],
  apis: [
    {
      method: 'POST',
      path: '/posts',
      purpose: 'Persist an immutable post ID and payload.',
    },
    {
      method: 'GET',
      path: '/feed?cursor={cursor}',
      purpose: 'Merge visible posts and paginate in production.',
    },
  ],
  entities: [
    { name: 'Post', fields: 'postId PK, authorId, sequence, text' },
    { name: 'Follow', fields: 'followerId + authorId UNIQUE' },
    { name: 'Inbox', fields: 'userId + postId UNIQUE, sourceSequence' },
  ],
  decisions: [
    'Persist the author log before issuing fan-out work.',
    'Push materializes inbox copies for future reads.',
    'Pull reads relevant author logs and ranks their candidates.',
    'Hybrid pulls high-fanout authors to avoid a celebrity write explosion.',
    'Merge by post identity so own-post and follower paths do not duplicate results.',
  ],
  breakInstructions:
    'Stop fan-out workers and compare push, pull and hybrid reads. Raise the follower threshold and inspect queued copies and read scans.',
  assumptions: {
    dailyActors: 100000,
    requestsPerActor: 20,
    peakMultiplier: 5,
    payloadBytes: 1000,
    retentionDays: 30,
  },
});
