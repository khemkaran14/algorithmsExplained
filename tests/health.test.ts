// @vitest-environment node
import { expect, it, vi, afterEach } from 'vitest';
const fixtures = vi.hoisted(() => ({ query: vi.fn(), limit: vi.fn() }));
vi.mock('@/lib/db', () => ({ db: { $queryRaw: fixtures.query } }));
vi.mock('@/security/rate-limit', () => ({ admitRequest: fixtures.limit }));
afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});
it('coalesces readiness checks, caches briefly and returns no credentials', async () => {
  fixtures.query.mockResolvedValue([{ one: 1 }]);
  fixtures.limit.mockResolvedValue({ allowed: true, store: 'redis' });
  const { GET } = await import('@/app/api/health/route');
  const responses = await Promise.all([GET(), GET(), GET()]);
  expect(fixtures.query).toHaveBeenCalledTimes(1);
  expect(responses[0].status).toBe(200);
  expect(responses[0].headers.get('Cache-Control')).toContain('no-store');
  expect(await responses[0].json()).toEqual({
    status: 'ok',
    checks: { database: 'ok', requestProtection: 'shared' },
  });
});
it('returns 503 without exception details when database and shared protection fail', async () => {
  fixtures.query.mockRejectedValue(
    new Error('postgres://private-secret@example'),
  );
  fixtures.limit.mockRejectedValue(new Error('private-token'));
  const { GET } = await import('@/app/api/health/route');
  const response = await GET();
  expect(response.status).toBe(503);
  expect(await response.text()).not.toMatch(/private|postgres/);
});
