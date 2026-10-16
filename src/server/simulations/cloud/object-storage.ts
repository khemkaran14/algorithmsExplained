import 'server-only';
import { z } from 'zod';
import { createHash } from 'node:crypto';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const key = z.string().regex(/^[a-z0-9/-]{1,24}$/);
const schema = z
  .object({
    provider: z.enum(['aws', 'gcp']).default('aws'),
    versioning: z.boolean().default(true),
    archiveRetention: z.number().int().min(0).max(24).default(0),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({
            kind: z.literal('put'),
            key,
            value: z.string().max(64),
            expectedToken: z.string().max(64).optional(),
            ifAbsent: z.boolean().default(false),
          }),
          z.object({
            kind: z.literal('get'),
            key,
            version: z.string().max(12).optional(),
          }),
          z.object({
            kind: z.literal('delete'),
            key,
            version: z.string().max(12).optional(),
          }),
          z.object({ kind: z.literal('tick') }),
        ]),
      )
      .min(1)
      .max(32),
  })
  .strict();
export const objectStorage: Visualizer<z.infer<typeof schema>> = {
  id: 's3-cloud-storage',
  maxSize: 32,
  measureSize: (p) => p.operations.length,
  inputHint:
    'Serialized object/version operations and compare-token writes. AWS-style versioned deletion adds a delete marker; explicitly deleting the current marker can reveal an older version. GCP-style deletion archives/removes the current live generation without creating a marker, and archived generations do not automatically become live. Restore an archived value by a new put. Model tokens are SHA-256 fixtures, not real provider ETags/generations; native precondition APIs differ. Retention 0 disables the simple archive-expiry policy.',
  controls: [
    {
      key: 'provider',
      label: 'Cloud mapping',
      type: 'select',
      options: [
        { value: 'aws', label: 'S3-style version/delete-marker semantics' },
        { value: 'gcp', label: 'Cloud Storage-style generation semantics' },
      ],
    },
    {
      key: 'versioning',
      label: 'Retain previous object versions',
      type: 'boolean',
    },
    {
      key: 'archiveRetention',
      label: 'Expire archived data after operation ticks (0 = off)',
      type: 'number',
      min: 0,
      max: 24,
    },
  ],
  presets: {
    best: schema.parse({
      operations: [
        { kind: 'put', key: 'photo', value: 'one' },
        { kind: 'get', key: 'photo' },
      ],
    }),
    average: schema.parse({
      operations: [
        { kind: 'put', key: 'photo', value: 'one' },
        { kind: 'put', key: 'photo', value: 'two' },
        { kind: 'delete', key: 'photo' },
        { kind: 'get', key: 'photo' },
        { kind: 'get', key: 'photo', version: 'v1' },
        { kind: 'delete', key: 'photo', version: 'v3' },
        { kind: 'get', key: 'photo' },
      ],
    }),
    worst: schema.parse({
      archiveRetention: 2,
      operations: [
        { kind: 'put', key: 'record', value: 'first' },
        { kind: 'put', key: 'record', value: 'second' },
        {
          kind: 'put',
          key: 'record',
          value: 'unsafe',
          expectedToken: 'stale-token',
        },
        { kind: 'get', key: 'record', version: 'v1' },
        { kind: 'delete', key: 'record' },
        { kind: 'get', key: 'record' },
      ],
    }),
    random: (n) =>
      schema.parse({
        operations: Array.from(
          { length: Math.min(32, Math.max(1, n)) },
          (_, i) =>
            i % 3 === 2
              ? { kind: 'get', key: 'example' }
              : { kind: 'put', key: 'example', value: `value-${i}` },
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'Direct current-object metadata lookup',
    average:
      'Versioned writes retain immutable content records and update current metadata',
    worst:
      'Retained versions consume space; lifecycle cleanup scans archived records in this teaching model',
    space: 'O(retained content bytes + version metadata)',
    why: 'Objects are whole immutable values, not mounted file blocks. Real lifecycle timing, retention locks, legal holds, multipart ETags, consistency contracts and permissions are product-specific and not implemented here.',
    metric: { label: 'Object versions created', keys: ['createdVersions'] },
  },
  *generate(p) {
    type Version = {
      id: string;
      value: string | null;
      token: string | null;
      marker: boolean;
      created: number;
      archivedAt: number | null;
    };
    const objects = new Map<string, Version[]>(),
      current = new Map<string, string | null>(),
      history: {
        tick: number;
        kind: string;
        key: string | null;
        status: string;
        value: string | null;
        version: string | null;
        token: string | null;
      }[] = [],
      c = counters();
    let serial = 0;
    c.createdVersions = 0;
    c.expiredVersions = 0;
    c.preconditionFailures = 0;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        {
          id: 'client',
          label: 'Object API + write preconditions',
          x: 0,
          y: 100,
        },
        {
          id: 'metadata',
          label: 'Current-key / version metadata',
          x: 260,
          y: 100,
        },
        {
          id: 'versions',
          label:
            p.provider === 'aws'
              ? 'Immutable versions + delete markers'
              : 'Live/archived object generations',
          x: 520,
          y: 100,
        },
        {
          id: 'lifecycle',
          label: 'Archived-version lifecycle policy',
          x: 520,
          y: 260,
        },
      ],
      edges: [
        { from: 'client', to: 'metadata' },
        { from: 'metadata', to: 'versions' },
        { from: 'lifecycle', to: 'versions' },
      ],
    };
    function live(key: string) {
      return (objects.get(key) ?? []).find((v) => v.id === current.get(key));
    }
    yield frame(
      scene,
      'Object keys, current versions and archived content are different concepts; a delete does not always erase every retained version.',
      c,
      1,
      { provider: p.provider },
    );
    for (let tick = 0; tick < p.operations.length; tick++) {
      if (p.archiveRetention > 0)
        for (const [key, versions] of objects) {
          const retained = versions.filter(
            (v) =>
              v.id === current.get(key) ||
              v.marker ||
              tick - (v.archivedAt ?? v.created) < p.archiveRetention,
          );
          c.expiredVersions += versions.length - retained.length;
          objects.set(key, retained);
        }
      const op = p.operations[tick];
      let status = '',
        value: string | null = null,
        version: string | null = null,
        token: string | null = null;
      if (op.kind === 'tick') status = 'lifecycle-tick';
      else {
        const versions = objects.get(op.key) ?? [],
          active = live(op.key),
          exists = active !== undefined && !active.marker;
        if (op.kind === 'put') {
          const valid =
            (!op.ifAbsent || !exists) &&
            (op.expectedToken === undefined ||
              (exists && active.token === op.expectedToken));
          yield frame(
            scene,
            'Evaluate write preconditions against the current live object before allocating a new version.',
            c,
            3,
            {
              key: op.key,
              exists,
              conditional: op.expectedToken !== undefined || op.ifAbsent,
            },
            [],
            {
              prompt: 'Can this put replace/create the current object?',
              choices: ['Accept conditional write', 'Reject precondition'],
              answer: valid
                ? 'Accept conditional write'
                : 'Reject precondition',
              hint: 'ifAbsent requires no live object; an expected token must equal the current live token. A marker is not live content.',
            },
          );
          if (!valid) {
            status = 'precondition-failed';
            c.preconditionFailures++;
          } else {
            const row: Version = {
              id: `v${++serial}`,
              value: op.value,
              token: createHash('sha256').update(op.value).digest('hex'),
              marker: false,
              created: tick,
              archivedAt: null,
            };
            if (active) active.archivedAt = tick;
            objects.set(op.key, p.versioning ? [...versions, row] : [row]);
            current.set(op.key, row.id);
            value = row.value;
            version = row.id;
            token = row.token;
            status = 'stored';
            c.createdVersions++;
            c.writes++;
          }
        } else if (op.kind === 'get') {
          const row = op.version
            ? versions.find((v) => v.id === op.version)
            : active;
          c.reads++;
          if (!row || row.marker) status = 'not-found';
          else {
            status = 'found';
            value = row.value;
            version = row.id;
            token = row.token;
          }
        } else if (op.version) {
          const found = versions.some((v) => v.id === op.version);
          if (!found) status = 'version-not-found';
          else {
            const retained = versions.filter((v) => v.id !== op.version);
            objects.set(op.key, retained);
            if (current.get(op.key) === op.version)
              current.set(
                op.key,
                p.provider === 'aws' ? (retained.at(-1)?.id ?? null) : null,
              );
            const revealed = live(op.key);
            if (revealed) revealed.archivedAt = null;
            status = 'version-permanently-deleted';
            c.writes++;
          }
        } else if (p.provider === 'aws' && p.versioning) {
          if (active) active.archivedAt = tick;
          const marker: Version = {
            id: `v${++serial}`,
            value: null,
            token: null,
            marker: true,
            created: tick,
            archivedAt: null,
          };
          objects.set(op.key, [...versions, marker]);
          current.set(op.key, marker.id);
          version = marker.id;
          status = 'delete-marker-created';
          c.createdVersions++;
          c.writes++;
        } else {
          if (active) active.archivedAt = tick;
          if (!p.versioning) objects.delete(op.key);
          current.set(op.key, null);
          status = p.versioning ? 'live-generation-archived' : 'object-deleted';
          c.writes++;
        }
      }
      history.push({
        tick,
        kind: op.kind,
        key: 'key' in op ? op.key : null,
        status,
        value,
        version,
        token,
      });
      yield frame(
        scene,
        'Retain the exact version outcome and distinguish current-object visibility from archived data retention.',
        c,
        5,
        {
          tick,
          status,
          retainedVersions: [...objects.values()].reduce(
            (n, rows) => n + rows.length,
            0,
          ),
        },
        [
          {
            id: status === 'precondition-failed' ? 'client' : 'versions',
            kind: status === 'precondition-failed' ? 'error' : 'visited',
          },
        ],
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          provider: p.provider,
          objects: Object.fromEntries(objects),
          current: Object.fromEntries(current),
          history,
          createdVersions: c.createdVersions,
          expiredVersions: c.expiredVersions,
          preconditionFailures: c.preconditionFailures,
        },
      },
      'Versioning is not a complete backup policy. Permissions, retention rules, recovery testing and independent copies determine the actual recovery boundary.',
      c,
      6,
    );
  },
};
