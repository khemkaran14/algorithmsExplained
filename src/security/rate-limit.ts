/** Fixed-window admission. No actor identity or request content is logged. */
export type Budget = { scope: string; limit: number; windowSec: number };
export type Admission = {
  allowed: boolean;
  retryAfter: number;
  remaining: number;
  store: 'memory' | 'redis';
};
export class LimiterUnavailable extends Error {}
export function budgetFor(path: string): Budget {
  if (path.startsWith('/api/auth/') || path === '/sign-in')
    return { scope: 'auth', limit: 20, windowSec: 300 };
  if (path.startsWith('/api/payments/'))
    return { scope: 'payment', limit: 12, windowSec: 60 };
  if (path.startsWith('/api/admin/'))
    return { scope: 'admin', limit: 30, windowSec: 60 };
  if (path.startsWith('/api/lessons/') || path.startsWith('/api/tools/'))
    return { scope: 'frames', limit: 40, windowSec: 60 };
  if (path.startsWith('/api/webhooks/'))
    return { scope: 'webhook', limit: 600, windowSec: 60 };
  return { scope: 'api', limit: 120, windowSec: 60 };
}
export class MemoryLimiter {
  private entries = new Map<string, { count: number; expires: number }>();
  private sweptAt = -1;
  constructor(private maxKeys = 10000) {}
  admit(key: string, budget: Budget, now = Date.now()): Admission {
    const tick = Math.floor(now / 1000),
      window = Math.floor(tick / budget.windowSec),
      expires = (window + 1) * budget.windowSec;
    if (this.sweptAt !== tick) {
      for (const [key, value] of this.entries)
        if (value.expires <= tick) this.entries.delete(key);
      this.sweptAt = tick;
    }
    const name = `${budget.scope}:${window}:${key}`;
    let entry = this.entries.get(name);
    if (!entry) {
      if (this.entries.size >= this.maxKeys)
        throw new LimiterUnavailable('Rate limiter capacity exceeded.');
      entry = { count: 0, expires };
      this.entries.set(name, entry);
    }
    entry.count = Math.min(budget.limit + 1, entry.count + 1);
    return {
      allowed: entry.count <= budget.limit,
      retryAfter: Math.max(1, expires - tick),
      remaining: Math.max(0, budget.limit - entry.count),
      store: 'memory',
    };
  }
}
const memory = new MemoryLimiter();
export function clientAddress(
  headers: Headers,
  config: { vercel?: string; trustedHeader?: string } = {
    vercel: process.env.VERCEL,
    trustedHeader: process.env.TRUSTED_PROXY_IP_HEADER,
  },
) {
  // Only enable a self-hosted proxy header if that proxy overwrites it and denies direct ingress.
  const header =
    config.vercel === '1' ? 'x-vercel-forwarded-for' : config.trustedHeader;
  if (
    !header ||
    !['x-vercel-forwarded-for', 'x-real-ip', 'cf-connecting-ip'].includes(
      header,
    )
  )
    return 'unavailable';
  const value = headers.get(header)?.split(',')[0].trim();
  return value && value.length <= 64 && /^[0-9a-fA-F:.]+$/.test(value)
    ? value
    : 'unavailable';
}
export async function actorKey(address: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`algoverse-rate-v1:${address}`),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}
const script =
  "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]); end; return n";
export async function admitRequest(
  key: string,
  budget: Budget,
  now = Date.now(),
): Promise<Admission> {
  const url = process.env.UPSTASH_REDIS_REST_URL,
    token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.RATE_LIMIT_MODE !== 'memory'
    )
      throw new LimiterUnavailable('Shared rate limiter is not configured.');
    return memory.admit(key, budget, now);
  }
  try {
    const endpoint = new URL(url);
    if (
      endpoint.protocol !== 'https:' ||
      endpoint.username ||
      endpoint.password ||
      !endpoint.hostname.endsWith('.upstash.io')
    )
      throw new Error('Invalid rate-limit endpoint');
    const tick = Math.floor(now / 1000),
      window = Math.floor(tick / budget.windowSec),
      retryAfter = (window + 1) * budget.windowSec - tick;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        'EVAL',
        script,
        1,
        `algoverse:rate:${budget.scope}:${window}:${key}`,
        budget.windowSec + 1,
      ]),
      signal: AbortSignal.timeout(2000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Rate-limit store unavailable');
    const data: unknown = await response.json();
    if (
      !data ||
      typeof data !== 'object' ||
      !('result' in data) ||
      typeof data.result !== 'number' ||
      !Number.isSafeInteger(data.result) ||
      data.result < 1
    )
      throw new Error('Invalid rate-limit result');
    return {
      allowed: data.result <= budget.limit,
      retryAfter: Math.max(1, retryAfter),
      remaining: Math.max(0, budget.limit - data.result),
      store: 'redis',
    };
  } catch {
    throw new LimiterUnavailable('Shared rate limiter is unavailable.');
  }
}
