import 'server-only';
import { withCaseStudy } from './overview';
import { videoStreaming } from './content-delivery';
export default withCaseStudy(videoStreaming, {
  requirements: [
    'Adapt media quality to changing link capacity.',
    'Measure playback stalls and buffer occupancy.',
    'Keep outages separate from successful segment downloads.',
  ],
  apis: [
    {
      method: 'GET',
      path: '/videos/{id}/manifest',
      purpose: 'Return rendition metadata and segment references.',
    },
    {
      method: 'GET',
      path: '/media/{id}/{rendition}/{segment}',
      purpose: 'Fetch an encoded segment through a CDN.',
    },
  ],
  entities: [
    { name: 'Video', fields: 'id, ownerId, duration, processingState' },
    {
      name: 'Rendition',
      fields: 'videoId + bitrate, codec, segmentDuration, objectPrefix',
    },
  ],
  decisions: [
    'Ingestion and transcoding prepare immutable segments before playback.',
    'Object storage holds renditions and a CDN serves repeated reads.',
    'A manifest advertises compatible quality choices.',
    'Select quality from a prior estimate, never future measured bandwidth.',
    'Buffer drains during a download; a zero-bandwidth interval retries the same segment.',
  ],
  breakInstructions:
    'Compare adaptive and fixed-high selection on a falling-bandwidth trace. Insert zero-bandwidth intervals and inspect pending segments, stalls and transferred bytes.',
  assumptions: {
    dailyActors: 100000,
    requestsPerActor: 20,
    peakMultiplier: 5,
    payloadBytes: 1000,
    retentionDays: 30,
  },
});
