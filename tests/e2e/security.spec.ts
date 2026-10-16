import { expect, test } from '@playwright/test';
test('production CSP permits lesson interaction with unique nonces and health reports readiness without secrets', async ({
  page,
  request,
}) => {
  const violations: string[] = [];
  await page.addInitScript(() => {
    addEventListener('securitypolicyviolation', (event) => {
      const values = window as unknown as { cspViolations?: string[] };
      (values.cspViolations ??= []).push(
        (event as SecurityPolicyViolationEvent).violatedDirective,
      );
    });
  });
  const response = await page.goto('/learn/dsa/sorting/bubble-sort');
  const csp = response!.headers()['content-security-policy'];
  expect(csp).toContain("'strict-dynamic'");
  expect(csp).not.toContain('unsafe-eval');
  expect(csp).toContain("frame-ancestors 'none'");
  await page.getByRole('button', { name: 'Step forward', exact: true }).click();
  await expect(page.getByLabel('Current frame')).toContainText('2 /');
  await page
    .getByRole('button', { name: 'Search lessons (Ctrl or Command K)' })
    .click();
  await page.getByLabel('Search title, concept or tag').fill('bubble');
  await expect(
    page.getByRole('link', { name: /Bubble sort.*dsa/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  const codeTab = page.getByRole('tab', { name: 'code', exact: true });
  if (await codeTab.isVisible()) await codeTab.click();
  await page
    .getByLabel('Code language', { exact: true })
    .selectOption('python');
  const code = page.getByLabel('Synchronized code');
  await expect(code).toBeVisible();
  await expect(code.locator('[aria-current="step"]')).toBeVisible();
  violations.push(
    ...(await page.evaluate(
      () =>
        (window as unknown as { cspViolations?: string[] }).cspViolations ?? [],
    )),
  );
  expect(violations).toEqual([]);
  const second = await request.get('/');
  expect(second.headers()['content-security-policy']).not.toBe(csp);
  const health = await request.get('/api/health');
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({
    status: 'ok',
    checks: { database: 'ok', requestProtection: 'local-preview' },
  });
});
