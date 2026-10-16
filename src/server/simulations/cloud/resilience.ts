import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const schema = z
  .object({
    strategy: z
      .enum(['single-zone', 'multi-zone', 'cross-region', 'backup-restore'])
      .default('multi-zone'),
    replicas: z.number().int().min(1).max(5).default(3),
    zones: z.number().int().min(2).max(3).default(3),
    writesPerTick: z.number().int().min(0).max(8).default(2),
    ticks: z.number().int().min(1).max(24).default(16),
    fault: z.enum(['none', 'zone', 'region']).default('zone'),
    failAt: z.number().int().min(0).max(23).default(6),
    restoreAt: z.number().int().min(0).max(24).default(0),
    replicationDelay: z.number().int().min(0).max(8).default(2),
    backupEvery: z.number().int().min(1).max(12).default(4),
    detection: z.number().int().min(0).max(8).default(1),
    promotion: z.number().int().min(0).max(8).default(2),
    restoreDuration: z.number().int().min(1).max(12).default(5),
  })
  .strict()
  .refine(
    (p) => p.restoreAt === 0 || p.restoreAt > p.failAt,
    'Restoration must follow the failure, or be zero.',
  );
type Input = z.infer<typeof schema>;
export function resilience(
  slug = 'regions-availability-zones',
): Visualizer<Input> {
  return {
    id: slug,
    maxSize: 24,
    measureSize: (p) => p.ticks,
    inputHint:
      'A fixed majority of primary-region replicas synchronously acknowledges the modeled writes. Single-zone colocates them; other strategies spread them over zones. A zone fault affects zone 0; region fault affects the primary region. Cross-region snapshots finish only while the primary quorum is available; an outage cancels unfinished transfers. Replication is asynchronous and promotion fences the old primary; backup restore starts from the last completed snapshot. RPO is counted lost acknowledged records and RTO in model ticks, not a cloud SLA or time guarantee.',
    controls: [
      {
        key: 'strategy',
        label: 'Failure-domain / DR strategy',
        type: 'select',
        options: [
          'single-zone',
          'multi-zone',
          'cross-region',
          'backup-restore',
        ].map((value) => ({ value, label: value })),
      },
      {
        key: 'replicas',
        label: 'Primary-region replicas',
        type: 'number',
        min: 1,
        max: 5,
      },
      {
        key: 'fault',
        label: 'Failed primary domain',
        type: 'select',
        options: ['none', 'zone', 'region'].map((value) => ({
          value,
          label: value,
        })),
      },
      {
        key: 'replicationDelay',
        label: 'Cross-region snapshot delay ticks',
        type: 'number',
        min: 0,
        max: 8,
      },
      {
        key: 'backupEvery',
        label: 'Backup interval ticks',
        type: 'number',
        min: 1,
        max: 12,
      },
      {
        key: 'detection',
        label: 'Detection delay ticks',
        type: 'number',
        min: 0,
        max: 8,
      },
    ],
    presets: {
      best: schema.parse({ strategy: 'multi-zone', fault: 'zone' }),
      average: schema.parse({
        strategy: 'cross-region',
        fault: 'region',
        replicationDelay: 3,
      }),
      worst: schema.parse({
        strategy: 'backup-restore',
        fault: 'region',
        backupEvery: 5,
        restoreDuration: 7,
      }),
      random: (n) =>
        schema.parse({
          ticks: Math.min(24, Math.max(1, n)),
          strategy: 'cross-region',
          fault: 'region',
          failAt: Math.min(6, Math.max(0, n - 2)),
        }),
    },
    validateInput: (raw) => schema.parse(raw),
    complexity: {
      best: 'A surviving configured majority continues service inside the primary region',
      average:
        'O(ticks × replicas + retained snapshot records) in this bounded exercise',
      worst:
        'Regional failure may require delayed promotion or snapshot restore and can lose recent asynchronous records',
      space: 'O(acknowledged records + queued snapshots)',
      why: 'The primary quorum is a chosen abstract failure policy, not a vendor consensus or managed failover implementation. Real RPO/RTO require measured procedures, backup integrity, networking, application recovery and failover drills.',
      metric: { label: 'Acknowledged writes', keys: ['acknowledged'] },
    },
    *generate(p) {
      const c = counters();
      c.acknowledged = 0;
      c.rejected = 0;
      const primary: number[] = [];
      let next = 1,
        secondary: number[] = [],
        backup: number[] = [],
        active: 'primary' | 'secondary' | 'restored' = 'primary',
        restored: number[] = [],
        unavailableSince: number | null = null,
        recoveryAt: number | null = null,
        firstUnavailable: number | null = null,
        lastBackupTick: number | null = null,
        failoverLost: number[] = [];
      const snapshots: { due: number; records: number[] }[] = [],
        acknowledged: number[] = [],
        history: {
          tick: number;
          healthyPrimaryReplicas: number;
          quorum: number;
          active: string;
          available: boolean;
          accepted: number;
          rejected: number;
          storedRecords: number;
          backupTick: number | null;
        }[] = [],
        quorum = Math.floor(p.replicas / 2) + 1;
      const failed = (tick: number) =>
        p.fault !== 'none' &&
        tick >= p.failAt &&
        (p.restoreAt === 0 || tick < p.restoreAt);
      function healthyCount(tick: number) {
        return Array.from({ length: p.replicas }, (_, i) =>
          p.strategy === 'single-zone' ? 0 : i % p.zones,
        ).filter((zone) => !failed(tick) || (p.fault === 'zone' && zone !== 0))
          .length;
      }
      function current() {
        return active === 'primary'
          ? primary
          : active === 'secondary'
            ? secondary
            : restored;
      }
      function scene(): VisualState {
        return {
          kind: 'architecture',
          values: [],
          nodes: [
            ...Array.from({ length: p.replicas }, (_, i) => ({
              id: `replica${i}`,
              label: `Primary region / AZ ${p.strategy === 'single-zone' ? 0 : i % p.zones}: replica ${i}`,
              x: 0,
              y: i * 100,
            })),
            {
              id: 'secondary',
              label: `Secondary region: ${secondary.length} records`,
              x: 320,
              y: 80,
            },
            {
              id: 'backup',
              label: `Completed backup: ${backup.length} records`,
              x: 320,
              y: 240,
            },
            {
              id: 'route',
              label: `Writer routed to ${active}`,
              x: 600,
              y: 120,
            },
          ],
          edges: [
            ...Array.from({ length: p.replicas }, (_, i) => ({
              from: 'route',
              to: `replica${i}`,
            })),
            {
              from: 'replica0',
              to: 'secondary',
              label: `async ${p.replicationDelay} ticks`,
            },
            {
              from: 'replica0',
              to: 'backup',
              label: `every ${p.backupEvery} ticks`,
            },
          ],
        };
      }
      yield frame(
        scene(),
        'Availability zones and regions are different failure domains; replication scope and recovery policy define what survives.',
        c,
        1,
        { strategy: p.strategy, quorum },
      );
      for (let tick = 0; tick < p.ticks; tick++) {
        if (active === 'primary' && healthyCount(tick) < quorum)
          snapshots.length = 0;
        if (active === 'primary')
          for (let i = 0; i < snapshots.length;)
            if (snapshots[i].due <= tick) {
              secondary = [...snapshots[i].records];
              snapshots.splice(i, 1);
            } else i++;
        const healthy = healthyCount(tick);
        let available = active !== 'primary' || healthy >= quorum;
        if (!available) {
          unavailableSince ??= tick;
          firstUnavailable ??= tick;
          const elapsed = tick - unavailableSince,
            canPromote =
              p.strategy === 'cross-region' &&
              elapsed >= p.detection + p.promotion,
            canRestore =
              p.strategy === 'backup-restore' &&
              elapsed >= p.detection + p.restoreDuration;
          yield frame(
            scene(),
            'A failed majority cannot acknowledge new primary writes. Choose whether the configured recovery path is ready.',
            c,
            3,
            { tick, healthy, quorum, elapsed },
            [{ id: 'route', kind: 'error' }],
            {
              prompt: 'Can this strategy resume writes at this tick?',
              choices: [
                'Continue waiting / reject writes',
                'Promote an asynchronous secondary',
                'Restore the completed backup',
              ],
              answer: canPromote
                ? 'Promote an asynchronous secondary'
                : canRestore
                  ? 'Restore the completed backup'
                  : 'Continue waiting / reject writes',
              hint: 'Compare outage elapsed time with detection plus promotion/restore delay; having a backup does not make it instantly online.',
            },
          );
          if (canPromote) {
            active = 'secondary';
            available = true;
            snapshots.length = 0;
            failoverLost = acknowledged.filter((id) => !secondary.includes(id));
            recoveryAt = tick;
          } else if (canRestore) {
            active = 'restored';
            restored = [...backup];
            available = true;
            failoverLost = acknowledged.filter((id) => !restored.includes(id));
            recoveryAt = tick;
          }
        } else if (active === 'primary' && unavailableSince !== null) {
          recoveryAt ??= tick;
          unavailableSince = null;
        }
        let accepted = 0,
          rejected = 0;
        for (let i = 0; i < p.writesPerTick; i++)
          if (available) {
            const id = next++;
            current().push(id);
            acknowledged.push(id);
            accepted++;
            c.acknowledged++;
            c.writes++;
          } else {
            rejected++;
            c.rejected++;
          }
        if (active === 'primary' && available) {
          if (p.strategy === 'cross-region') {
            if (p.replicationDelay === 0) secondary = [...primary];
            else
              snapshots.push({
                due: tick + p.replicationDelay,
                records: [...primary],
              });
          }
          if ((tick + 1) % p.backupEvery === 0) {
            backup = [...primary];
            lastBackupTick = tick;
          }
        }
        history.push({
          tick,
          healthyPrimaryReplicas: healthy,
          quorum,
          active,
          available,
          accepted,
          rejected,
          storedRecords: current().length,
          backupTick: lastBackupTick,
        });
        yield frame(
          scene(),
          'Record accepted writes, outage rejection, backup age and the active writer; promoted writers fence the former primary.',
          c,
          5,
          {
            tick,
            healthyPrimaryReplicas: healthy,
            active,
            available,
            accepted,
            rejected,
            records: current().length,
          },
          failed(tick)
            ? Array.from({ length: p.replicas }, (_, i) => i)
                .filter(
                  (i) =>
                    p.fault === 'region' ||
                    (p.strategy === 'single-zone' ? 0 : i % p.zones) === 0,
                )
                .map((i) => ({ id: `replica${i}`, kind: 'error' as const }))
            : [],
        );
      }
      const lost = acknowledged.filter((id) => !current().includes(id));
      yield frame(
        {
          ...scene(),
          result: {
            strategy: p.strategy,
            history,
            active,
            acknowledged: acknowledged.length,
            rejected: c.rejected,
            storedRecords: current(),
            lostAcknowledgedRecords: lost,
            rpoLostWrites: lost.length,
            failoverLostRecords: failoverLost,
            rtoTicks:
              firstUnavailable === null
                ? 0
                : recoveryAt === null
                  ? null
                  : recoveryAt - firstUnavailable,
            stillUnavailable: !history.at(-1)!.available,
            lastBackupTick,
            assumptions:
              'Fixed primary-region majority; async cross-region snapshots; complete periodic backup snapshots; RTO in arbitrary ticks. Not a cloud SLA, real RPO/RTO measurement or consensus implementation.',
          },
        },
        'A copied dataset, a tested restore procedure and a fenced active writer are different requirements. Measure actual recovery before promising an RPO/RTO.',
        c,
        6,
      );
    },
  };
}
