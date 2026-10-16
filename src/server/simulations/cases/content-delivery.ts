import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const url = z
  .string()
  .url()
  .max(256)
  .refine(
    (value) => ['http:', 'https:'].includes(new URL(value).protocol),
    'Use an HTTP(S) example URL.',
  );
const shortSchema = z
  .object({
    strategy: z.enum(['sequence', 'hash-probe']).default('sequence'),
    length: z.number().int().min(1).max(6).default(3),
    ttl: z.number().int().min(1).max(32).default(5),
    loseInvalidation: z.boolean().default(false),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({
            kind: z.literal('create'),
            url,
            key: z.string().min(1).max(24),
          }),
          z.object({
            kind: z.literal('resolve'),
            code: z.string().min(1).max(6),
          }),
          z.object({
            kind: z.literal('delete'),
            code: z.string().min(1).max(6),
          }),
        ]),
      )
      .min(1)
      .max(32),
  })
  .strict();
const alphabet =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function encode(value: number, length: number) {
  let out = '';
  for (let i = 0; i < length; i++) {
    out = alphabet[value % 62] + out;
    value = Math.floor(value / 62);
  }
  return out;
}
export const urlShortener: Visualizer<z.infer<typeof shortSchema>> = {
  id: 'url-shortener',
  maxSize: 32,
  measureSize: (p) => p.operations.length,
  inputHint:
    'Create requests have an HTTP(S) URL and an idempotency key. Sequential code 001 is the first default token. Resolve/delete use code strings. hash-probe uses a tiny illustrative hash and explicit collision checks; tokens are examples, not access secrets.',
  controls: [
    {
      key: 'strategy',
      label: 'Code allocation',
      type: 'select',
      options: [
        { value: 'sequence', label: 'Atomic counter + base62' },
        { value: 'hash-probe', label: 'Hash candidate + collision probe' },
      ],
    },
    {
      key: 'length',
      label: 'Base62 token length',
      type: 'number',
      min: 1,
      max: 6,
    },
    {
      key: 'ttl',
      label: 'Redirect cache TTL ticks',
      type: 'number',
      min: 1,
      max: 32,
    },
    {
      key: 'loseInvalidation',
      label: 'Lose delete invalidation',
      type: 'boolean',
    },
  ],
  presets: {
    best: shortSchema.parse({
      operations: [
        { kind: 'create', url: 'https://example.test/a', key: 'request-a' },
        { kind: 'resolve', code: '001' },
      ],
    }),
    average: shortSchema.parse({
      operations: [
        { kind: 'create', url: 'https://example.test/a', key: 'request-a' },
        { kind: 'resolve', code: '001' },
        { kind: 'resolve', code: '001' },
        { kind: 'create', url: 'https://example.test/a', key: 'request-a' },
        { kind: 'delete', code: '001' },
        { kind: 'resolve', code: '001' },
      ],
    }),
    worst: shortSchema.parse({
      loseInvalidation: true,
      operations: [
        { kind: 'create', url: 'https://example.test/private', key: 'one' },
        { kind: 'resolve', code: '001' },
        { kind: 'delete', code: '001' },
        { kind: 'resolve', code: '001' },
      ],
    }),
    random: (n) =>
      shortSchema.parse({
        operations: Array.from(
          { length: Math.min(32, Math.max(1, n)) },
          (_, i) =>
            i === 0
              ? { kind: 'create', url: 'https://example.test/a', key: 'one' }
              : { kind: 'resolve', code: '001' },
        ),
      }),
  },
  validateInput: (raw) => shortSchema.parse(raw),
  complexity: {
    metric: { label: 'Durable redirect lookups', keys: ['databaseReads'] },
    best: 'Expected O(1) cached redirect',
    average: 'O(length) token encoding plus collision checks',
    worst:
      'Allocation probes bounded token space; stale caches can outlive revocation',
    space: 'O(links+idempotency keys+cached tokens)',
    why: 'A durable unique-code constraint and an atomic allocation/idempotency boundary protect creation. Reads can use a TTL cache, but deletion needs a revocation policy. This serial model exposes collisions and invalidation loss; it does not supply production abuse controls, atomic distributed counters or unguessable access tokens.',
  },
  *generate(input) {
    type Link = { url: string; active: boolean };
    const c = counters(),
      links = new Map<string, Link>(),
      keys = new Map<string, { url: string; code: string }>(),
      cache = new Map<string, { url: string; expires: number }>(),
      history: {
        kind: string;
        status: string;
        code: string | null;
        url: string | null;
        stale: boolean;
      }[] = [];
    let next = 1;
    c.databaseReads = 0;
    c.cacheHits = 0;
    c.collisions = 0;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'client', label: 'Create / redirect client', x: 0, y: 100 },
        { id: 'api', label: 'Link API + idempotency', x: 220, y: 100 },
        {
          id: 'allocator',
          label:
            input.strategy === 'sequence'
              ? 'Counter + base62'
              : 'Hash + unique constraint',
          x: 440,
          y: 0,
        },
        { id: 'cache', label: 'Redirect TTL cache', x: 440, y: 160 },
        { id: 'db', label: 'Code → URL + active flag', x: 680, y: 100 },
      ],
      edges: [
        { from: 'client', to: 'api' },
        { from: 'api', to: 'allocator' },
        { from: 'allocator', to: 'db' },
        { from: 'api', to: 'cache' },
        { from: 'cache', to: 'db' },
      ],
    };
    yield frame(
      scene,
      'Separate durable token allocation from the high-volume redirect path.',
      c,
      1,
      { length: input.length, space: 62 ** input.length },
    );
    for (let tick = 0; tick < input.operations.length; tick++) {
      for (const [code, entry] of cache)
        if (entry.expires <= tick) cache.delete(code);
      const op = input.operations[tick];
      yield frame(
        scene,
        'Validate identity and ownership state before applying this link operation.',
        c,
        3,
        { tick, operation: op.kind },
        [],
        {
          prompt:
            'Does a short token automatically make a private URL authorized?',
          choices: ['No', 'Yes'],
          answer: 'No',
          hint: 'Shortening chooses an identifier; authentication/authorization and abuse policy are separate.',
        },
      );
      if (op.kind === 'create') {
        const previous = keys.get(op.key);
        if (previous) {
          history.push({
            kind: op.kind,
            status: previous.url === op.url ? 'replayed' : 'conflict',
            code: previous.url === op.url ? previous.code : null,
            url: null,
            stale: false,
          });
          continue;
        }
        const space = 62 ** input.length;
        let candidate = next % space;
        if (input.strategy === 'hash-probe') {
          candidate = 0;
          for (const ch of op.url)
            candidate = (candidate * 31 + ch.charCodeAt(0)) % space;
        }
        let code = encode(candidate, input.length),
          attempts = 0;
        while (links.has(code) && attempts < space) {
          candidate = (candidate + 1) % space;
          code = encode(candidate, input.length);
          attempts++;
          c.collisions++;
        }
        if (attempts === space) {
          history.push({
            kind: op.kind,
            status: 'space-exhausted',
            code: null,
            url: null,
            stale: false,
          });
          continue;
        }
        links.set(code, { url: op.url, active: true });
        keys.set(op.key, { url: op.url, code });
        next++;
        c.writes += 2;
        history.push({
          kind: op.kind,
          status: 'created',
          code,
          url: op.url,
          stale: false,
        });
      } else if (op.kind === 'delete') {
        const link = links.get(op.code);
        if (link) link.active = false;
        if (!input.loseInvalidation) cache.delete(op.code);
        c.writes++;
        history.push({
          kind: op.kind,
          status: link ? 'deleted' : 'not-found',
          code: op.code,
          url: null,
          stale: false,
        });
      } else {
        let target = cache.get(op.code)?.url ?? null;
        const hit = target !== null;
        if (hit) c.cacheHits++;
        else {
          c.databaseReads++;
          const link = links.get(op.code);
          if (link?.active) {
            target = link.url;
            cache.set(op.code, { url: target, expires: tick + input.ttl });
            c.writes++;
          }
        }
        history.push({
          kind: op.kind,
          status: target ? 'redirect' : 'not-found',
          code: op.code,
          url: target,
          stale: target !== null && !links.get(op.code)?.active,
        });
      }
      yield frame(
        scene,
        'Record the durable or cached result and its freshness status.',
        c,
        5,
        { tick, lastStatus: history.at(-1)!.status, links: links.size },
        [{ id: op.kind === 'resolve' ? 'cache' : 'db', kind: 'visited' }],
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          history,
          links: Object.fromEntries(links),
          cacheHits: c.cacheHits,
          databaseReads: c.databaseReads,
          collisions: c.collisions,
        },
      },
      'A useful redirect design also defines revocation, privacy, expiration and abuse controls.',
      c,
      6,
      { links: links.size },
    );
  },
};
const videoSchema = z
  .object({
    policy: z.enum(['adaptive', 'fixed-high']).default('adaptive'),
    bandwidth: z.array(z.number().min(0).max(20)).min(1).max(24),
    initialEstimate: z.number().min(0.1).max(20).default(1),
    initialBuffer: z.number().min(0).max(20).default(2),
    segmentSeconds: z.number().min(1).max(6).default(2),
  })
  .strict();
export const videoStreaming: Visualizer<z.infer<typeof videoSchema>> = {
  id: 'video-streaming-design',
  maxSize: 24,
  measureSize: (p) => p.bandwidth.length,
  inputHint:
    'Each bandwidth value is Mbps for the next segment attempt. Zero is a modeled outage interval and retries the same segment later. Adaptive uses only its previous bandwidth estimate, not future samples. Bitrates are fixed example renditions 0.5/1/2/4 Mbps.',
  controls: [
    {
      key: 'policy',
      label: 'Player policy',
      type: 'select',
      options: [
        { value: 'adaptive', label: 'Adaptive bitrate' },
        { value: 'fixed-high', label: 'Always 4 Mbps' },
      ],
    },
    {
      key: 'initialEstimate',
      label: 'Initial bandwidth estimate (Mbps)',
      type: 'number',
      min: 0.1,
      max: 20,
      step: 0.1,
    },
    {
      key: 'initialBuffer',
      label: 'Initial buffer seconds',
      type: 'number',
      min: 0,
      max: 20,
      step: 0.5,
    },
  ],
  presets: {
    best: videoSchema.parse({ bandwidth: [8, 8, 8, 8] }),
    average: videoSchema.parse({ bandwidth: [1, 3, 0.5, 5, 1, 8, 2, 4] }),
    worst: videoSchema.parse({
      policy: 'fixed-high',
      bandwidth: [0.5, 0, 0.5, 0.5, 0, 1],
    }),
    random: (n) =>
      videoSchema.parse({
        bandwidth: Array.from(
          { length: Math.min(24, Math.max(1, n)) },
          (_, i) => [1, 3, 0.5, 5][i % 4],
        ),
      }),
  },
  validateInput: (raw) => videoSchema.parse(raw),
  complexity: {
    metric: { label: 'Downloaded payload bytes', keys: ['bytes'] },
    best: 'A cached rendition fits available throughput and buffer',
    average: 'Adaptive policy trades quality against rebuffering risk',
    worst: 'Origin/CDN outage or excessive bitrate stalls playback',
    space: 'O(attempts) teaching history plus playback buffer',
    why: 'Segment download time equals bitrate×segmentDuration/bandwidth. The player consumes buffered seconds during transfer, then adds the downloaded segment. The adaptive heuristic uses an EWMA estimate from completed transfers; it is illustrative, not an optimal or production ABR algorithm. Zero-bandwidth attempts consume one modeled outage interval without skipping missing media.',
  },
  *generate(input) {
    const c = counters(),
      rates = [0.5, 1, 2, 4],
      history: {
        attempt: number;
        segment: number;
        bandwidth: number;
        bitrate: number;
        downloadSeconds: number;
        stallSeconds: number;
        bufferSeconds: number;
        status: string;
      }[] = [];
    let estimate = input.initialEstimate,
      buffer = input.initialBuffer,
      stall = 0,
      segment = 0;
    const qualities: number[] = [];
    c.bytes = 0;
    c.outages = 0;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'source', label: 'Video upload', x: 0, y: 80 },
        { id: 'encoder', label: 'Renditions + manifest', x: 210, y: 80 },
        { id: 'storage', label: 'Object storage', x: 420, y: 80 },
        { id: 'cdn', label: 'CDN segment cache', x: 630, y: 80 },
        { id: 'player', label: 'ABR player + buffer', x: 840, y: 80 },
      ],
      edges: [
        { from: 'source', to: 'encoder' },
        { from: 'encoder', to: 'storage' },
        { from: 'storage', to: 'cdn' },
        { from: 'cdn', to: 'player' },
      ],
    };
    yield frame(
      scene,
      'Encode multiple renditions and let the player choose a segment quality under explicit assumptions.',
      c,
      1,
      { segmentSeconds: input.segmentSeconds, estimate, buffer },
    );
    for (let attempt = 0; attempt < input.bandwidth.length; attempt++) {
      const bandwidth = input.bandwidth[attempt],
        safe = estimate * 0.8 * (buffer < input.segmentSeconds ? 0.7 : 1),
        bitrate =
          input.policy === 'fixed-high'
            ? 4
            : ([...rates].reverse().find((rate) => rate <= safe) ?? rates[0]);
      yield frame(
        scene,
        'Choose quality using the previous estimate and current buffer, not future bandwidth.',
        c,
        3,
        { attempt, segment, estimate, buffer, bitrate, bandwidth },
        [{ id: 'player', kind: 'comparing' }],
        {
          prompt:
            'Can the next bandwidth sample be known perfectly before choosing quality?',
          choices: ['No', 'Yes'],
          answer: 'No',
          hint: 'The model exposes the sample for teaching; the adaptive policy only uses its prior estimate.',
        },
      );
      if (bandwidth === 0) {
        const lost = Math.max(0, input.segmentSeconds - buffer);
        stall += lost;
        buffer = Math.max(0, buffer - input.segmentSeconds);
        c.outages++;
        history.push({
          attempt,
          segment,
          bandwidth,
          bitrate,
          downloadSeconds: input.segmentSeconds,
          stallSeconds: lost,
          bufferSeconds: buffer,
          status: 'outage-retry-same-segment',
        });
        yield frame(
          scene,
          'An outage consumes buffered playback and leaves the same segment pending.',
          c,
          5,
          { attempt, segment, buffer, stall },
          [{ id: 'cdn->player', kind: 'error' }],
        );
        continue;
      }
      const download = (bitrate * input.segmentSeconds) / bandwidth,
        extra = Math.max(0, download - buffer);
      stall += extra;
      buffer = Math.max(0, buffer - download) + input.segmentSeconds;
      c.bytes += (bitrate * input.segmentSeconds * 1000000) / 8;
      qualities.push(bitrate);
      history.push({
        attempt,
        segment,
        bandwidth,
        bitrate,
        downloadSeconds: download,
        stallSeconds: extra,
        bufferSeconds: buffer,
        status: 'downloaded',
      });
      segment++;
      estimate = 0.5 * estimate + 0.5 * bandwidth;
      yield frame(
        scene,
        'Consume buffer during the transfer, then append the completed media segment.',
        c,
        5,
        { attempt, segment, buffer, stall, estimate },
        [{ id: 'cdn->player', kind: 'moving' }],
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          downloadedSegments: segment,
          pendingSegments: input.bandwidth.length - segment,
          stallSeconds: stall,
          bufferSeconds: buffer,
          averageBitrateMbps: qualities.length
            ? qualities.reduce((a, b) => a + b, 0) / qualities.length
            : null,
          bytes: c.bytes,
          history,
        },
      },
      'Quality, stalls, availability and byte cost must be evaluated together.',
      c,
      6,
      { downloadedSegments: segment, stallSeconds: stall },
    );
  },
};
