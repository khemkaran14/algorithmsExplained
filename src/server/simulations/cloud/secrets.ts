import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const client = z.enum(['a', 'b']);
const schema = z
  .object({
    cacheTTL: z.number().int().min(1).max(12).default(4),
    clientARead: z.boolean().default(true),
    clientBRead: z.boolean().default(true),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({ kind: z.literal('create-pending') }),
          z.object({
            kind: z.literal('configure-target'),
            success: z.boolean(),
          }),
          z.object({
            kind: z.literal('validate-pending'),
            success: z.boolean(),
          }),
          z.object({ kind: z.literal('promote') }),
          z.object({ kind: z.literal('retire-old') }),
          z.object({ kind: z.literal('discard-pending') }),
          z.object({ kind: z.literal('fetch'), client }),
          z.object({ kind: z.literal('use'), client }),
          z.object({ kind: z.literal('revoke-reader'), client }),
          z.object({ kind: z.literal('grant-reader'), client }),
          z.object({ kind: z.literal('tick') }),
        ]),
      )
      .min(1)
      .max(24),
  })
  .strict();
export const secrets: Visualizer<z.infer<typeof schema>> = {
  id: 'secrets-manager-secret-manager',
  maxSize: 24,
  measureSize: (p) => p.operations.length,
  inputHint:
    'Credential-version identifiers are public symbolic fixtures; no real secrets are stored/read. Rotation creates a pending version, configures the target, validates it, then promotes the current pointer. Old target credentials retire separately. Client caches have explicit TTLs. Revoking secret-read permission does not erase an already cached credential; target rotation/revocation is a separate action. AWS staged rotation and Google Secret Manager version/rotation-event APIs differ; this is an application workflow, not either complete SDK.',
  controls: [
    {
      key: 'cacheTTL',
      label: 'Application credential cache TTL ticks',
      type: 'number',
      min: 1,
      max: 12,
    },
    {
      key: 'clientARead',
      label: 'Client A may fetch secret versions',
      type: 'boolean',
    },
    {
      key: 'clientBRead',
      label: 'Client B may fetch secret versions',
      type: 'boolean',
    },
  ],
  presets: {
    best: schema.parse({
      operations: [
        { kind: 'create-pending' },
        { kind: 'configure-target', success: true },
        { kind: 'validate-pending', success: true },
        { kind: 'promote' },
        { kind: 'fetch', client: 'a' },
        { kind: 'use', client: 'a' },
        { kind: 'retire-old' },
        { kind: 'use', client: 'a' },
      ],
    }),
    average: schema.parse({
      cacheTTL: 12,
      operations: [
        { kind: 'use', client: 'a' },
        { kind: 'create-pending' },
        { kind: 'configure-target', success: true },
        { kind: 'validate-pending', success: true },
        { kind: 'promote' },
        { kind: 'retire-old' },
        { kind: 'use', client: 'a' },
        { kind: 'fetch', client: 'a' },
        { kind: 'use', client: 'a' },
      ],
    }),
    worst: schema.parse({
      operations: [
        { kind: 'create-pending' },
        { kind: 'configure-target', success: false },
        { kind: 'validate-pending', success: false },
        { kind: 'promote' },
        { kind: 'use', client: 'a' },
        { kind: 'discard-pending' },
      ],
    }),
    random: (n) =>
      schema.parse({
        operations: Array.from(
          { length: Math.min(24, Math.max(1, n)) },
          (_, i) => ({ kind: 'use', client: i % 2 ? 'a' : 'b' }),
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'A fresh authorized application cache avoids another secret-store fetch',
    average: 'O(events) version-pointer and symbolic credential checks',
    worst:
      'Premature retirement breaks clients still holding old credentials; failed validation must not promote',
    space: 'O(version metadata + clients + workflow history)',
    why: 'Secret access permission, credential validity at the dependent service and application cache lifetime are three independent states. Native provider rotation integrations, authorization policies, audit logs and protected secret material are outside this symbolic model.',
    metric: { label: 'Secret-store fetch attempts', keys: ['fetches'] },
  },
  *generate(p) {
    let active = 1,
      pending: number | null = null,
      next = 1,
      validated = false;
    const versions = new Set([1]),
      accepted = new Set([1]),
      readers = new Map<string, boolean>([
        ['a', p.clientARead],
        ['b', p.clientBRead],
      ]),
      cache = new Map<string, { version: number; expires: number }>(),
      history: {
        tick: number;
        kind: string;
        status: string;
        active: number;
        pending: number | null;
        credential: number | null;
        authenticated: boolean | null;
      }[] = [],
      c = counters();
    c.fetches = 0;
    c.authenticated = 0;
    c.authFailures = 0;
    function fetch(client: string, tick: number) {
      c.fetches++;
      if (!readers.get(client)) return false;
      cache.set(client, { version: active, expires: tick + p.cacheTTL });
      return true;
    }
    function scene(): VisualState {
      return {
        kind: 'architecture',
        values: [],
        nodes: [
          {
            id: 'rotate',
            label: 'Create → configure → validate → promote',
            x: 0,
            y: 0,
          },
          {
            id: 'manager',
            label: `Current v${active}; pending ${pending ?? 'none'}`,
            x: 280,
            y: 0,
          },
          {
            id: 'clients',
            label: 'Per-client permission + cached version',
            x: 0,
            y: 180,
          },
          {
            id: 'target',
            label: `Target accepts versions ${[...accepted].join(',')}`,
            x: 280,
            y: 180,
          },
        ],
        edges: [
          { from: 'rotate', to: 'manager' },
          { from: 'rotate', to: 'target' },
          { from: 'manager', to: 'clients', label: 'fetch if permitted' },
          {
            from: 'clients',
            to: 'target',
            label: 'authenticate with cached value',
          },
        ],
      };
    }
    yield frame(
      scene(),
      'A version in a secret manager is not automatically installed, tested or accepted by the dependent service.',
      c,
      1,
    );
    for (let tick = 0; tick < p.operations.length; tick++) {
      const op = p.operations[tick];
      let status = '',
        credential: number | null = null,
        authenticated: boolean | null = null;
      if (op.kind === 'create-pending') {
        if (pending !== null) status = 'pending-version-already-exists';
        else {
          pending = ++next;
          versions.add(pending);
          validated = false;
          status = 'pending-version-created';
        }
      } else if (op.kind === 'configure-target') {
        validated = false;
        if (pending === null) status = 'no-pending-version';
        else if (!op.success)
          status = 'target-configuration-failed-current-unchanged';
        else {
          accepted.add(pending);
          status = 'target-now-accepts-pending';
        }
      } else if (op.kind === 'validate-pending') {
        validated = pending !== null && accepted.has(pending) && op.success;
        status = validated ? 'pending-validated' : 'pending-validation-failed';
      } else if (op.kind === 'promote') {
        if (pending === null || !validated || !accepted.has(pending))
          status = 'promotion-rejected-unvalidated';
        else {
          active = pending;
          pending = null;
          validated = false;
          status = 'current-pointer-promoted';
        }
      } else if (op.kind === 'retire-old') {
        if (pending !== null) status = 'finish-or-discard-pending-first';
        else {
          for (const version of accepted)
            if (version !== active) accepted.delete(version);
          status = 'old-target-credentials-retired';
        }
      } else if (op.kind === 'discard-pending') {
        if (pending !== null) {
          accepted.delete(pending);
          pending = null;
          validated = false;
        }
        status = 'pending-discarded-current-unchanged';
      } else if (op.kind === 'revoke-reader') {
        readers.set(op.client, false);
        status = 'secret-fetch-permission-revoked';
      } else if (op.kind === 'grant-reader') {
        readers.set(op.client, true);
        status = 'secret-fetch-permission-granted';
      } else if (op.kind === 'fetch') {
        status = fetch(op.client, tick)
          ? 'current-version-fetched'
          : 'secret-fetch-denied';
        credential = cache.get(op.client)?.version ?? null;
      } else if (op.kind === 'use') {
        const cached = cache.get(op.client),
          fresh = cached !== undefined && cached.expires > tick;
        yield frame(
          scene(),
          'Choose where the client obtains its credential; target validity is checked separately afterward.',
          c,
          3,
          {
            client: op.client,
            tick,
            cachedVersion: cached?.version ?? null,
            expires: cached?.expires ?? null,
          },
          [],
          {
            prompt: 'What does this client do before authenticating?',
            choices: [
              'Use its fresh cached credential',
              'Fetch current secret version',
              'Reject missing secret-read permission',
            ],
            answer: fresh
              ? 'Use its fresh cached credential'
              : readers.get(op.client)
                ? 'Fetch current secret version'
                : 'Reject missing secret-read permission',
            hint: 'Secret-store permission is checked on fetch. Already retrieved material remains in the application cache until its chosen TTL.',
          },
        );
        if (!fresh && !fetch(op.client, tick)) {
          status = 'refresh-denied-client-fails-closed';
          authenticated = false;
          c.authFailures++;
        } else {
          credential = cache.get(op.client)!.version;
          authenticated = accepted.has(credential);
          if (authenticated) {
            c.authenticated++;
            status = 'target-authentication-succeeded';
          } else {
            c.authFailures++;
            status = 'cached-credential-no-longer-accepted';
          }
        }
      } else status = 'time-advanced';
      history.push({
        tick,
        kind: op.kind,
        status,
        active,
        pending,
        credential,
        authenticated,
      });
      yield frame(
        scene(),
        'Keep current-pointer state, reader access, cached credentials and target acceptance visible together.',
        c,
        5,
        { tick, status, current: active, pending },
        [
          {
            id:
              status.includes('failed') ||
              status.includes('denied') ||
              status.includes('rejected') ||
              status.includes('no-longer')
                ? 'target'
                : 'manager',
            kind:
              status.includes('failed') ||
              status.includes('denied') ||
              status.includes('rejected') ||
              status.includes('no-longer')
                ? 'error'
                : 'visited',
          },
        ],
      );
    }
    yield frame(
      {
        ...scene(),
        result: {
          active,
          pending,
          validated,
          knownVersions: [...versions],
          acceptedCredentialVersions: [...accepted],
          readers: Object.fromEntries(readers),
          clientCaches: Object.fromEntries(cache),
          history,
          fetches: c.fetches,
          authenticated: c.authenticated,
          authenticationFailures: c.authFailures,
          scope:
            'Symbolic public version IDs only; no real secret content, provider account or target authentication request.',
        },
      },
      'Validate before promotion, allow a planned overlap for client refresh, and retire old credentials at the dependent service when the rotation policy requires it.',
      c,
      6,
    );
  },
};
