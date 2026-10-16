import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const client = z.enum(['a', 'b']);
const schema = z
  .object({
    strategy: z
      .enum(['uncoordinated', 'advisory-lock', 'compare-version'])
      .default('advisory-lock'),
    blockedClient: z.enum(['none', 'a', 'b']).default('none'),
    partitionAt: z.number().int().min(0).max(23).default(0),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({ kind: z.literal('read'), client }),
          z.object({
            kind: z.literal('append'),
            client,
            text: z.string().min(1).max(16),
          }),
          z.object({ kind: z.literal('lock'), client }),
          z.object({ kind: z.literal('unlock'), client }),
          z.object({ kind: z.literal('crash'), client }),
          z.object({ kind: z.literal('recover'), client }),
        ]),
      )
      .min(1)
      .max(24),
  })
  .strict();
export const fileStorage: Visualizer<z.infer<typeof schema>> = {
  id: 'efs-filestore',
  maxSize: 24,
  measureSize: (p) => p.operations.length,
  inputHint:
    'Two clients share one file service. The exercise is application-level read-modify-write over remembered file values, not native atomic O_APPEND. Compare no coordination, a cooperative advisory critical section, and an application metadata CAS abstraction. A lock must be acquired before the read used by its write. A network partition does not release a lock; explicit confirmed crash releases it in this model. No complete NFS lock/recovery protocol or provider CAS feature is implied.',
  controls: [
    {
      key: 'strategy',
      label: 'Application update policy',
      type: 'select',
      options: ['uncoordinated', 'advisory-lock', 'compare-version'].map(
        (value) => ({ value, label: value }),
      ),
    },
    {
      key: 'blockedClient',
      label: 'Client network partition',
      type: 'select',
      options: ['none', 'a', 'b'].map((value) => ({ value, label: value })),
    },
  ],
  presets: {
    best: schema.parse({
      operations: [
        { kind: 'lock', client: 'a' },
        { kind: 'read', client: 'a' },
        { kind: 'append', client: 'a', text: 'A' },
        { kind: 'unlock', client: 'a' },
        { kind: 'lock', client: 'b' },
        { kind: 'read', client: 'b' },
        { kind: 'append', client: 'b', text: 'B' },
        { kind: 'unlock', client: 'b' },
      ],
    }),
    average: schema.parse({
      strategy: 'uncoordinated',
      operations: [
        { kind: 'read', client: 'a' },
        { kind: 'read', client: 'b' },
        { kind: 'append', client: 'a', text: 'A' },
        { kind: 'append', client: 'b', text: 'B' },
      ],
    }),
    worst: schema.parse({
      operations: [
        { kind: 'read', client: 'a' },
        { kind: 'lock', client: 'a' },
        { kind: 'append', client: 'a', text: 'stale' },
        { kind: 'lock', client: 'b' },
        { kind: 'crash', client: 'a' },
        { kind: 'lock', client: 'b' },
        { kind: 'read', client: 'b' },
        { kind: 'append', client: 'b', text: 'B' },
      ],
    }),
    random: (n) =>
      schema.parse({
        strategy: 'uncoordinated',
        operations: Array.from(
          { length: Math.min(24, Math.max(1, n)) },
          (_, i) =>
            i % 2
              ? { kind: 'append', client: 'a', text: 'x' }
              : { kind: 'read', client: 'a' },
        ),
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'A coordinated critical section preserves another client’s update',
    average:
      'O(events + copied file bytes) in the bounded read-modify-write model',
    worst:
      'A stale uncoordinated write can overwrite another client’s committed text',
    space: 'O(file bytes + client snapshots + history)',
    why: 'EFS and Filestore provide shared filesystem access with product/protocol-specific locking, caching, performance and recovery rules. Application CAS is a separate abstraction here, not a claim that the underlying NFS API exposes a compare-version operation.',
    metric: { label: 'Committed file updates', keys: ['committed'] },
  },
  *generate(p) {
    type Client = z.infer<typeof client>;
    const snapshots = new Map<
        Client,
        { value: string; version: number; lockEpoch: number | null }
      >(),
      online = new Map<Client, boolean>([
        ['a', true],
        ['b', true],
      ]),
      history: {
        operation: number;
        client: string;
        kind: string;
        status: string;
        value: string;
        version: number;
      }[] = [],
      c = counters();
    let value = '',
      version = 0,
      owner: Client | null = null,
      epoch = 0;
    c.committed = 0;
    c.staleOverwrites = 0;
    c.conflicts = 0;
    function scene(): VisualState {
      return {
        kind: 'architecture',
        values: [],
        nodes: [
          { id: 'a', label: 'Client A: remembered read', x: 0, y: 0 },
          { id: 'b', label: 'Client B: remembered read', x: 0, y: 180 },
          {
            id: 'file',
            label: `Shared file: v${version}, ${Buffer.byteLength(value, 'utf8')} bytes`,
            x: 280,
            y: 80,
          },
          {
            id: 'lock',
            label: `Cooperative owner: ${owner ?? 'none'}`,
            x: 540,
            y: 80,
          },
        ],
        edges: [
          { from: 'a', to: 'file' },
          { from: 'b', to: 'file' },
          { from: 'file', to: 'lock' },
        ],
      };
    }
    yield frame(
      scene(),
      'A shared mount makes data accessible to multiple clients; it does not make every multi-operation application update atomic.',
      c,
      1,
    );
    for (let i = 0; i < p.operations.length; i++) {
      const op = p.operations[i];
      let status = '';
      if (op.kind === 'crash') {
        online.set(op.client, false);
        snapshots.delete(op.client);
        if (owner === op.client) owner = null;
        status = 'confirmed-client-crash';
      } else if (op.kind === 'recover') {
        online.set(op.client, true);
        status = 'client-recovered';
      } else if (!online.get(op.client)) status = 'client-offline';
      else if (p.blockedClient === op.client && i >= p.partitionAt)
        status = 'network-unavailable-lock-not-released';
      else if (op.kind === 'lock') {
        if (owner === null) {
          owner = op.client;
          epoch++;
          status = 'lock-acquired';
        } else
          status = owner === op.client ? 'lock-already-owned' : 'lock-waits';
      } else if (op.kind === 'unlock') {
        if (owner === op.client) {
          owner = null;
          status = 'unlocked';
        } else status = 'not-lock-owner';
      } else if (op.kind === 'read') {
        snapshots.set(op.client, {
          value,
          version,
          lockEpoch: owner === op.client ? epoch : null,
        });
        c.reads++;
        status = 'snapshot-read';
      } else {
        const base = snapshots.get(op.client),
          fresh = base?.version === version,
          locked = owner === op.client && base?.lockEpoch === epoch,
          can =
            base !== undefined &&
            (p.strategy === 'uncoordinated' ||
              (p.strategy === 'compare-version' ? fresh : locked && fresh));
        yield frame(
          scene(),
          'Validate the application’s coordination rule against the remembered read before replacing file contents.',
          c,
          3,
          {
            client: op.client,
            rememberedVersion: base?.version ?? null,
            currentVersion: version,
            lockOwner: owner,
          },
          [],
          {
            prompt: 'May this read-modify-write commit now?',
            choices: ['Commit the update', 'Reject and read/retry safely'],
            answer: can ? 'Commit the update' : 'Reject and read/retry safely',
            hint: 'A critical section must read after acquiring its current lock. CAS must use the current version. Uncoordinated mode deliberately permits stale overwrites.',
          },
        );
        if (!can) {
          status = !base
            ? 'read-required'
            : p.strategy === 'advisory-lock'
              ? 'fresh-read-under-owned-lock-required'
              : 'version-conflict';
          c.conflicts++;
        } else {
          if (!fresh) c.staleOverwrites++;
          value = base.value + op.text;
          version++;
          snapshots.set(op.client, {
            value,
            version,
            lockEpoch: owner === op.client ? epoch : null,
          });
          c.committed++;
          c.writes++;
          status = fresh ? 'committed' : 'stale-write-overwrote-prior-update';
        }
      }
      history.push({
        operation: i,
        client: op.client,
        kind: op.kind,
        status,
        value,
        version,
      });
      yield frame(
        scene(),
        'Track confirmed commits, rejected stale updates and lock ownership separately from network reachability.',
        c,
        5,
        { operation: i, status, version, lockOwner: owner },
        [
          {
            id: op.client,
            kind:
              status.includes('conflict') || status.includes('overwrote')
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
          value,
          version,
          owner,
          snapshots: Object.fromEntries(snapshots),
          online: Object.fromEntries(online),
          history,
          committed: c.committed,
          staleOverwrites: c.staleOverwrites,
          conflicts: c.conflicts,
          assumptions:
            'Cooperative application RMW/lock/CAS example, not native append behavior or a full NFS locking and recovery implementation.',
        },
      },
      'Choose a supported filesystem protocol and a correct application critical section. Shared access and safe concurrent updates are different requirements.',
      c,
      6,
    );
  },
};
