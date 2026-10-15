'use client';
import { useMemo, useSyncExternalStore } from 'react';
import {
  EMPTY,
  localSchema,
  mergeProgress,
  mergeLibrary,
  type LocalLearning,
  type Progress,
  type LibraryEntry,
} from './progress';
const KEY = 'algoverse.learning.v1';
function subscribe(cb: () => void) {
  window.addEventListener('storage', cb);
  window.addEventListener('algoverse-learning', cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener('algoverse-learning', cb);
  };
}
function snapshot() {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}
export function readLearning(): LocalLearning {
  try {
    const parsed = localSchema.safeParse(JSON.parse(snapshot() || 'null'));
    return parsed.success ? parsed.data : structuredClone(EMPTY);
  } catch {
    return structuredClone(EMPTY);
  }
}
export function writeLearning(value: LocalLearning) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
    window.dispatchEvent(new Event('algoverse-learning'));
  } catch {
    /* Browsing remains usable when browser storage is unavailable. */
  }
}
export function updateProgress(
  slug: string,
  patch: Partial<Omit<Progress, 'slug'>>,
) {
  const state = readLearning();
  const now = new Date().toISOString();
  const current = state.progress[slug] ?? {
    slug,
    status: 'in-progress' as const,
    lastFrame: 0,
    timeSpentSec: 0,
    quizScore: 0,
    completedAt: null,
    updatedAt: now,
  };
  const next = { ...current, ...patch, slug, updatedAt: now };
  writeLearning({
    ...state,
    progress: mergeProgress(state.progress, { [slug]: next }),
  });
}
export function updateLibrary(
  slug: string,
  patch: Partial<Omit<LibraryEntry, 'slug'>>,
) {
  const state = readLearning();
  writeLearning({
    ...state,
    library: {
      ...state.library,
      [slug]: {
        ...(state.library[slug] ?? { slug, bookmarked: false, note: '' }),
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    },
  });
}
export function useLearning() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => '');
  return useMemo(() => {
    try {
      const parsed = localSchema.safeParse(JSON.parse(raw || 'null'));
      return parsed.success ? parsed.data : EMPTY;
    } catch {
      return EMPTY;
    }
  }, [raw]);
}
export async function syncLearning() {
  try {
    const local = readLearning();
    const response = await fetch('/api/progress', { cache: 'no-store' });
    if (!response.ok) return false;
    const existing = localSchema.safeParse(await response.json());
    if (!existing.success) return false;
    const input =
      local.owner && local.owner !== existing.data.owner
        ? { ...EMPTY, owner: existing.data.owner }
        : local;
    const result = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!result.ok) return false;
    const parsed = localSchema.safeParse(await result.json());
    if (parsed.success) {
      const latest = readLearning();
      const base =
        latest.owner && latest.owner !== parsed.data.owner ? EMPTY : latest;
      writeLearning({
        version: 1,
        owner: parsed.data.owner,
        progress: mergeProgress(base.progress, parsed.data.progress),
        library: mergeLibrary(base.library, parsed.data.library),
      });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
