'use client';

export const LEARNING_KEY = 'algoverse.learning.v1';
export const IDENTITY_EVENT = 'algoverse-learning';
let owner: string | null | undefined;
let pending: Promise<boolean> | undefined;
let generation = 0;

export function learningOwner() {
  return owner;
}

export function clearLearningIdentity() {
  generation++;
  owner = null;
  try {
    localStorage.removeItem(LEARNING_KEY);
    localStorage.removeItem('algoverse.reviews.v1');
  } catch {}
  window.dispatchEvent(new Event(IDENTITY_EVENT));
}

export function verifyLearningIdentity(): Promise<boolean> {
  if (pending) return pending;
  const current = generation;
  owner = undefined;
  window.dispatchEvent(new Event(IDENTITY_EVENT));
  pending = (async () => {
    try {
      const response = await fetch('/api/session-state', { cache: 'no-store' });
      if (!response.ok) return false;
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || !('owner' in data)) return false;
      if (
        data.owner !== null &&
        (typeof data.owner !== 'string' || !data.owner)
      )
        return false;
      if (current !== generation) return false;
      owner = data.owner;
      try {
        const raw = JSON.parse(
          localStorage.getItem(LEARNING_KEY) ?? 'null',
        ) as { owner?: unknown; version?: unknown } | null;
        if (raw?.owner && raw.owner !== owner) {
          localStorage.removeItem(LEARNING_KEY);
          localStorage.removeItem('algoverse.reviews.v1');
        } else if (raw && raw.version === 1 && !raw.owner && owner) {
          localStorage.setItem(LEARNING_KEY, JSON.stringify({ ...raw, owner }));
        }
      } catch {}
      window.dispatchEvent(new Event(IDENTITY_EVENT));
      return true;
    } catch {
      // Keep private data quarantined during outages; do not erase it.
      return false;
    } finally {
      pending = undefined;
    }
  })();
  return pending;
}
