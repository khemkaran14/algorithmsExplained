import { test, expect } from '@playwright/test';

test('public policies, search metadata and crawler files are usable without exposing private routes', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://learndatastructureandalgorithms.divyrs.com',
  );
  const data = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  expect(JSON.parse(data!)['@type']).toBe('WebSite');
  for (const path of [
    'privacy',
    'terms',
    'refunds',
    'cookies',
    'contact',
    'shipping',
    'about',
  ]) {
    await expect(
      page.locator('footer').getByRole('link', {
        name: new RegExp(
          path === 'shipping'
            ? 'delivery'
            : path === 'refunds'
              ? 'refund'
              : path === 'cookies'
                ? 'cookie'
                : path,
          'i',
        ),
      }),
    ).toBeVisible();
    const response = await request.get(`/${path}`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).not.toContain('Template — review with a lawyer');
    expect(html).toContain(
      `https://learndatastructureandalgorithms.divyrs.com/${path}`,
    );
  }
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Disallow: /admin');
  const map = await request.get('/sitemap.xml');
  expect(map.status()).toBe(200);
  const xml = await map.text();
  expect(xml).toContain('/learn/dsa/sorting/bubble-sort');
  expect(xml).not.toMatch(/<loc>[^<]*\/(account|admin|api|sign-in)/);
  const image = await request.get('/opengraph-image');
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toContain('image/png');
  expect((await image.body()).length).toBeGreaterThan(1000);
  const privateResponse = await request.get('/api/access');
  expect(privateResponse.headers()['x-robots-tag']).toBe(
    'noindex, nofollow, noarchive',
  );
});
