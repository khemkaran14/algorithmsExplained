// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { siteOrigin, pageMetadata } from '@/config/site';
import { catalog, lessonUrl } from '@/content/catalog';
afterEach(() => vi.unstubAllEnvs());
it('publishes authored public URLs while excluding account and authentication routes', () => {
  vi.stubEnv('SITE_URL', 'https://example.com');
  const urls = sitemap().map((x) => x.url);
  expect(new Set(urls).size).toBe(urls.length);
  for (const lesson of catalog.filter((l) => l.status !== 'planned'))
    expect(urls).toContain(`https://example.com${lessonUrl(lesson)}`);
  for (const path of ['/privacy', '/terms', '/refunds', '/cookies', '/contact'])
    expect(urls).toContain(`https://example.com${path}`);
  expect(
    urls.some((url) =>
      /\/(account|admin|api|sign-in|checkout|revision)(\/|$)/.test(url),
    ),
  ).toBe(false);
  expect(robots().sitemap).toBe('https://example.com/sitemap.xml');
});
it('uses configured origins rather than request hosts and rejects credentials or path-bearing origins', () => {
  for (const origin of [
    'javascript:alert(1)',
    'https://user:password@example.com',
    'https://example.com/other',
  ]) {
    vi.stubEnv('SITE_URL', origin);
    expect(() => siteOrigin()).toThrow();
  }
  vi.stubEnv('SITE_URL', 'https://example.com');
  expect(
    pageMetadata('Sorting', 'Visual sorting', '/learn/dsa/sorting').alternates
      ?.canonical,
  ).toBe('/learn/dsa/sorting');
});
