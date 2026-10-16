import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const vm = z.number().int().min(0).max(3);
const schema = z
  .object({
    diskZone: z.enum(['a', 'b']).default('a'),
    vmZones: z
      .array(z.enum(['a', 'b']))
      .min(1)
      .max(4)
      .default(['a', 'a', 'b']),
    multiWriter: z.boolean().default(false),
    allowForceDetach: z.boolean().default(false),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({ kind: z.literal('attach'), vm }),
          z.object({
            kind: z.literal('detach'),
            vm,
            force: z.boolean().default(false),
          }),
          z.object({
            kind: z.literal('write'),
            vm,
            value: z.number().int().min(-999).max(999),
          }),
          z.object({ kind: z.literal('read'), vm }),
          z.object({ kind: z.literal('flush'), vm }),
          z.object({ kind: z.literal('crash'), vm }),
          z.object({ kind: z.literal('snapshot') }),
          z.object({ kind: z.literal('restore') }),
        ]),
      )
      .min(1)
      .max(32),
  })
  .strict()
  .refine(
    (p) =>
      p.operations.every((op) => !('vm' in op) || op.vm < p.vmZones.length),
    'Every VM index must exist.',
  );
export const blockStorage: Visualizer<z.infer<typeof schema>> = {
  id: 'ebs-persistent-disk',
  maxSize: 32,
  measureSize: (p) => p.operations.length,
  inputHint:
    'One persistent block value, zonal attachment constraints, per-VM unflushed buffers and durable flushes. Single-writer is the baseline; multi-writer is an explicitly unsafe coordination experiment, not a claim every disk type supports it. Crash/force detach loses that VM’s dirty cache but retains durable disk data. Snapshots capture flushed data only; restore selects a new unattached replacement-disk generation. No real volumes or VMs are touched.',
  controls: [
    {
      key: 'diskZone',
      label: 'Disk zone',
      type: 'select',
      options: [
        { value: 'a', label: 'Zone A' },
        { value: 'b', label: 'Zone B' },
      ],
    },
    {
      key: 'multiWriter',
      label: 'Demonstrate uncoordinated multiple writers',
      type: 'boolean',
    },
    {
      key: 'allowForceDetach',
      label: 'Permit explicit dirty force-detach experiment',
      type: 'boolean',
    },
  ],
  presets: {
    best: schema.parse({
      operations: [
        { kind: 'attach', vm: 0 },
        { kind: 'write', vm: 0, value: 7 },
        { kind: 'flush', vm: 0 },
        { kind: 'detach', vm: 0 },
        { kind: 'attach', vm: 1 },
        { kind: 'read', vm: 1 },
      ],
    }),
    average: schema.parse({
      operations: [
        { kind: 'attach', vm: 0 },
        { kind: 'write', vm: 0, value: 7 },
        { kind: 'snapshot' },
        { kind: 'crash', vm: 0 },
        { kind: 'attach', vm: 1 },
        { kind: 'read', vm: 1 },
        { kind: 'detach', vm: 1 },
        { kind: 'restore' },
        { kind: 'attach', vm: 0 },
        { kind: 'read', vm: 0 },
      ],
    }),
    worst: schema.parse({
      multiWriter: true,
      operations: [
        { kind: 'attach', vm: 0 },
        { kind: 'attach', vm: 1 },
        { kind: 'write', vm: 0, value: 5 },
        { kind: 'write', vm: 1, value: 9 },
        { kind: 'flush', vm: 1 },
        { kind: 'flush', vm: 0 },
        { kind: 'read', vm: 1 },
        { kind: 'attach', vm: 2 },
      ],
    }),
    random: (n) =>
      schema.parse({
        operations: [
          { kind: 'attach', vm: 0 },
          ...Array.from({ length: Math.min(28, Math.max(1, n)) }, (_, i) =>
            i % 2
              ? { kind: 'flush', vm: 0 }
              : { kind: 'write', vm: 0, value: i },
          ),
          { kind: 'read', vm: 0 },
        ],
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'A same-zone compatible attachment reuses persistent data',
    average:
      'One small metadata/cache operation per event in the bounded model',
    worst:
      'Uncoordinated multi-writer buffers overwrite each other; an unflushed crash loses recent writes',
    space: 'O(VM buffers + attachments + snapshot history)',
    why: 'EBS and Persistent Disk / Hyperdisk have type-specific attachment, replication and multi-writer rules. The scalar model does not implement a filesystem, real I/O ordering, device fencing or application-consistent snapshots.',
    metric: { label: 'Durable flushes', keys: ['flushes'] },
  },
  *generate(p) {
    const attached = new Set<number>(),
      cache = new Map<number, number>(),
      snapshots: { value: number; generation: number; operation: number }[] =
        [],
      history: {
        operation: number;
        kind: string;
        vm: number | null;
        status: string;
        value: number | null;
      }[] = [],
      c = counters();
    let durable = 0,
      generation = 1;
    c.flushes = 0;
    c.lostDirtyBuffers = 0;
    c.attachments = 0;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        ...p.vmZones.map((zone, i) => ({
          id: `vm${i}`,
          label: `VM ${i} in zone ${zone.toUpperCase()}`,
          x: 0,
          y: i * 100,
        })),
        {
          id: 'disk',
          label: `Zonal persistent block device (${p.diskZone})`,
          x: 300,
          y: 100,
        },
        { id: 'snapshot', label: 'Snapshot of durable data', x: 580, y: 100 },
      ],
      edges: [
        ...p.vmZones.map((_, i) => ({ from: `vm${i}`, to: 'disk' })),
        { from: 'disk', to: 'snapshot' },
      ],
    };
    yield frame(
      scene,
      'A persistent disk survives a VM process, but VM buffers and filesystem consistency need their own guarantees.',
      c,
      1,
    );
    for (let i = 0; i < p.operations.length; i++) {
      const op = p.operations[i];
      let status = '',
        value: number | null = null;
      if (op.kind === 'attach') {
        const can =
          attached.has(op.vm) ||
          (p.vmZones[op.vm] === p.diskZone &&
            (p.multiWriter || attached.size === 0));
        yield frame(
          scene,
          'Check failure-domain compatibility and existing writer ownership before attaching.',
          c,
          3,
          {
            vm: op.vm,
            vmZone: p.vmZones[op.vm],
            diskZone: p.diskZone,
            writers: attached.size,
          },
          [],
          {
            prompt: 'Can this VM attach the disk under the chosen rules?',
            choices: [
              'Attach / reuse existing attachment',
              'Reject incompatible attachment',
            ],
            answer: can
              ? 'Attach / reuse existing attachment'
              : 'Reject incompatible attachment',
            hint: 'The baseline is one writer in the same zone. Multi-writer mode is an explicit coordination-risk experiment.',
          },
        );
        if (!can)
          status =
            p.vmZones[op.vm] !== p.diskZone
              ? 'zone-mismatch'
              : 'writer-conflict';
        else {
          if (!attached.has(op.vm)) c.attachments++;
          attached.add(op.vm);
          status = 'attached';
        }
      } else if (op.kind === 'snapshot') {
        snapshots.push({ value: durable, generation, operation: i });
        status = 'durable-snapshot-created';
        value = durable;
        c.writes++;
      } else if (op.kind === 'restore') {
        if (attached.size)
          status = 'replacement-restore-requires-unattached-state';
        else if (!snapshots.length) status = 'no-snapshot';
        else {
          durable = snapshots.at(-1)!.value;
          generation++;
          cache.clear();
          status = 'replacement-disk-created';
          value = durable;
        }
      } else if (op.kind === 'crash') {
        if (cache.has(op.vm)) {
          cache.delete(op.vm);
          c.lostDirtyBuffers++;
        }
        attached.delete(op.vm);
        status = 'VM-buffer-and-attachment-lost';
      } else if (!attached.has(op.vm)) status = 'not-attached';
      else if (op.kind === 'write') {
        cache.set(op.vm, op.value);
        value = op.value;
        c.writes++;
        status = 'dirty-VM-buffer';
      } else if (op.kind === 'read') {
        value = cache.get(op.vm) ?? durable;
        c.reads++;
        status = cache.has(op.vm) ? 'read-own-buffer' : 'read-durable-disk';
      } else if (op.kind === 'flush') {
        if (cache.has(op.vm)) {
          durable = cache.get(op.vm)!;
          cache.delete(op.vm);
          c.flushes++;
          c.writes++;
        }
        value = durable;
        status = 'durable-flush';
      } else {
        if (cache.has(op.vm) && !(op.force && p.allowForceDetach))
          status = 'dirty-detach-rejected';
        else {
          if (cache.delete(op.vm)) c.lostDirtyBuffers++;
          attached.delete(op.vm);
          status = op.force ? 'force-detached' : 'detached';
        }
      }
      history.push({
        operation: i,
        kind: op.kind,
        vm: 'vm' in op ? op.vm : null,
        status,
        value,
      });
      yield frame(
        scene,
        'Track device durability separately from per-VM buffered writes and attachment state.',
        c,
        5,
        {
          operation: i,
          status,
          durable,
          generation,
          attached: [...attached].join(','),
        },
        [
          {
            id:
              status.includes('mismatch') || status.includes('conflict')
                ? 'disk'
                : 'snapshot',
            kind:
              status.includes('mismatch') || status.includes('conflict')
                ? 'error'
                : 'visited',
          },
        ],
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          durable,
          generation,
          attached: [...attached],
          dirtyBuffers: Object.fromEntries(cache),
          snapshots,
          history,
          flushes: c.flushes,
          lostDirtyBuffers: c.lostDirtyBuffers,
          assumptions:
            'One scalar block and declared metadata rules; no real cloud device, clustered filesystem or application-consistent snapshot guarantee.',
        },
      },
      'Shared access to block devices needs supported disk types and a coordination-safe filesystem/application; attachment alone does not make concurrent writes safe.',
      c,
      6,
    );
  },
};
