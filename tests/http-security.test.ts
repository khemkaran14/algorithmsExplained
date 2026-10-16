// @vitest-environment node
import { expect, it, vi, afterEach } from 'vitest';
import { readBody } from '@/lib/http';
import {
  MemoryLimiter,
  budgetFor,
  clientAddress,
  admitRequest,
  LimiterUnavailable,
} from '@/security/rate-limit';
import { contentSecurityPolicy } from '@/security/csp';
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it('rejects oversized declared bodies before pulling, and cancels chunked UTF-8 byte overflow', async () => {
  let cancelled = false;
  const body = new ReadableStream({
    start(c) {
      c.enqueue(new TextEncoder().encode('€€'));
    },
    cancel() {
      cancelled = true;
    },
  });
  const request = new Request('http://localhost', {
    method: 'POST',
    body,
    duplex: 'half',
  } as RequestInit);
  await expect(readBody(request, 5)).rejects.toMatchObject({ status: 413 });
  expect(cancelled).toBe(true);
  const declared = new Request('http://localhost', {
    method: 'POST',
    headers: { 'content-length': '100' },
    body: 'small',
  });
  await expect(readBody(declared, 8)).rejects.toMatchObject({ status: 413 });
});
it('decodes multibyte characters split across chunks and rejects invalid UTF-8', async () => {
  const bytes = new TextEncoder().encode('a€b');
  const body = new ReadableStream({
    start(c) {
      c.enqueue(bytes.slice(0, 2));
      c.enqueue(bytes.slice(2));
      c.close();
    },
  });
  expect(
    await readBody(
      new Request('http://localhost', {
        method: 'POST',
        body,
        duplex: 'half',
      } as RequestInit),
      5,
    ),
  ).toBe('a€b');
  await expect(
    readBody(
      new Request('http://localhost', {
        method: 'POST',
        body: new Uint8Array([255]),
      }),
    ),
  ).rejects.toMatchObject({ status: 400 });
});
it('fixed windows reset on boundaries and capacity exhaustion cannot evict a throttled identity', () => {
  const limiter = new MemoryLimiter(2),
    budget = { scope: 'test', limit: 2, windowSec: 60 };
  expect(limiter.admit('a', budget, 0).allowed).toBe(true);
  expect(limiter.admit('a', budget, 1000).allowed).toBe(true);
  expect(limiter.admit('a', budget, 2000).allowed).toBe(false);
  limiter.admit('b', budget, 2000);
  expect(() => limiter.admit('c', budget, 2000)).toThrow(LimiterUnavailable);
  expect(limiter.admit('a', budget, 60000).remaining).toBe(1);
});
it('does not trust arbitrary forwarded identities, and separates expensive budgets', () => {
  const h = new Headers({
    'x-forwarded-for': '1.2.3.4',
    'x-real-ip': '5.6.7.8',
  });
  expect(clientAddress(h, {})).toBe('unavailable');
  expect(clientAddress(h, { trustedHeader: 'x-real-ip' })).toBe('5.6.7.8');
  expect(budgetFor('/api/payments/order').scope).toBe('payment');
  expect(budgetFor('/api/lessons/a/frames').scope).toBe('frames');
});
it('production fails closed without a shared store unless memory preview is explicitly selected', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
  vi.stubEnv('RATE_LIMIT_MODE', '');
  await expect(
    admitRequest('a', budgetFor('/api/progress')),
  ).rejects.toBeInstanceOf(LimiterUnavailable);
  vi.stubEnv('RATE_LIMIT_MODE', 'memory');
  expect((await admitRequest('a', budgetFor('/api/progress'))).allowed).toBe(
    true,
  );
});
it('Redis limits use an atomic counter with TTL and errors never silently fall back', async () => {
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://fixture.upstash.io');
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fixture-secret');
  const fetch = vi.fn().mockResolvedValue(Response.json({ result: 13 }));
  vi.stubGlobal('fetch', fetch);
  const result = await admitRequest(
    'actor-hash',
    budgetFor('/api/payments/order'),
    0,
  );
  expect(result.allowed).toBe(false);
  expect(result.retryAfter).toBe(60);
  const command = JSON.parse(fetch.mock.calls[0][1].body);
  expect(command[0]).toBe('EVAL');
  expect(command[1]).toContain('EXPIRE');
  fetch.mockRejectedValue(new Error('offline'));
  await expect(
    admitRequest('actor-hash', budgetFor('/api/payments/order')),
  ).rejects.toBeInstanceOf(LimiterUnavailable);
});
it('production CSP uses a fresh nonce boundary without eval and blocks embedding', () => {
  const csp = contentSecurityPolicy('fixture', false);
  expect(csp).toContain("'nonce-fixture' 'strict-dynamic'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).not.toContain('unsafe-eval');
  expect(csp).toContain('https://checkout.razorpay.com');
  expect(contentSecurityPolicy('fixture', true)).toContain('unsafe-eval');
});
it('keeps raw UTF-8 BOM bytes represented for signature verification', async () => {
  expect(
    await readBody(
      new Request('http://localhost', {
        method: 'POST',
        body: new Uint8Array([239, 187, 191, 123, 125]),
      }),
    ),
  ).toBe('\uFEFF{}');
});
it('middleware overwrites inbound nonce claims and binds both request and response CSP', async () => {
  const { NextRequest } = await import('next/server');
  const { middleware } = await import('@/middleware');
  const a = await middleware(
    new NextRequest('http://localhost/learn', {
      headers: { 'x-nonce': 'attacker' },
    }),
  );
  const b = await middleware(new NextRequest('http://localhost/learn'));
  const nonce = a.headers.get('x-middleware-request-x-nonce');
  expect(nonce).toBeTruthy();
  expect(nonce).not.toBe('attacker');
  expect(a.headers.get('Content-Security-Policy')).toContain(
    `'nonce-${nonce}'`,
  );
  expect(a.headers.get('Content-Security-Policy')).not.toBe(
    b.headers.get('Content-Security-Policy'),
  );
  expect(a.headers.get('X-Frame-Options')).toBe('DENY');
});
