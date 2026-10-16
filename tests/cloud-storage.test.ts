import { expect, it } from 'vitest';
import { blockStorage } from '@/server/simulations/cloud/block-storage';
import { fileStorage } from '@/server/simulations/cloud/file-storage';
function block(raw: unknown) {
  return [...blockStorage.generate(blockStorage.validateInput(raw))].at(-1)!
    .state.result as {
    durable: number;
    lostDirtyBuffers: number;
    history: { status: string; value: number | null }[];
  };
}
function file(raw: unknown) {
  return [...fileStorage.generate(fileStorage.validateInput(raw))].at(-1)!.state
    .result as {
    value: string;
    owner: string | null;
    staleOverwrites: number;
    conflicts: number;
    history: { status: string }[];
  };
}
it('flushed blocks survive VM detach and reads from a replacement same-zone VM', () => {
  const r = block(blockStorage.presets.best);
  expect(r.durable).toBe(7);
  expect(r.history.at(-1)?.value).toBe(7);
});
it('a crash discards VM buffers while snapshots capture only durable blocks', () => {
  const r = block(blockStorage.presets.average);
  expect(r.durable).toBe(0);
  expect(r.lostDirtyBuffers).toBe(1);
  expect(r.history.at(-1)?.value).toBe(0);
});
it('rejects cross-zone and conflicting single-writer attachments', () => {
  const r = block({
    operations: [
      { kind: 'attach', vm: 0 },
      { kind: 'attach', vm: 1 },
      { kind: 'attach', vm: 2 },
    ],
  });
  expect(r.history.map((h) => h.status)).toEqual([
    'attached',
    'writer-conflict',
    'zone-mismatch',
  ]);
});
it('an uncoordinated multi-writer flush can overwrite another writer’s durable value', () => {
  const r = block(blockStorage.presets.worst);
  expect(r.durable).toBe(5);
  expect(r.history[6].value).toBe(5);
});
it('uncoordinated file RMW loses a prior update while a real critical-section read preserves it', () => {
  const unsafe = file(fileStorage.presets.average),
    safe = file(fileStorage.presets.best);
  expect(unsafe.value).toBe('B');
  expect(unsafe.staleOverwrites).toBe(1);
  expect(safe.value).toBe('AB');
  expect(safe.staleOverwrites).toBe(0);
});
it('CAS rejects a stale remembered file version instead of silently overwriting', () => {
  const r = file({
    ...fileStorage.presets.average,
    strategy: 'compare-version',
  });
  expect(r.value).toBe('A');
  expect(r.conflicts).toBe(1);
});
it('acquiring a lock after a stale read does not make the earlier read safe', () => {
  const r = file(fileStorage.presets.worst);
  expect(r.history[2].status).toBe('fresh-read-under-owned-lock-required');
  expect(r.value).toBe('B');
});
it('a network partition does not automatically release an existing file lock', () => {
  const r = file({
    blockedClient: 'a',
    partitionAt: 2,
    operations: [
      { kind: 'lock', client: 'a' },
      { kind: 'read', client: 'a' },
      { kind: 'append', client: 'a', text: 'A' },
      { kind: 'lock', client: 'b' },
    ],
  });
  expect(r.owner).toBe('a');
  expect(r.history[2].status).toBe('network-unavailable-lock-not-released');
  expect(r.history[3].status).toBe('lock-waits');
});
