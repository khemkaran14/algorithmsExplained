// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
const script = fileURLToPath(
  new URL('../scripts/check-payments.mjs', import.meta.url),
);
const credentials = {
  RAZORPAY_KEY_ID: 'rzp_test_fixtureOnly',
  RAZORPAY_KEY_SECRET: 'private-test-key-never-log',
  RAZORPAY_WEBHOOK_SECRET: 'private-webhook-never-log',
};

it('fails closed when payment settings are incomplete', () => {
  const result = spawnSync(process.execPath, [script], {
    env: { NODE_ENV: 'test' },
    encoding: 'utf8',
  });
  expect(result.status).toBe(1);
  expect(JSON.parse(result.stdout)).toMatchObject({
    ready: false,
    mode: 'unconfigured',
    provider: 'not_checked',
  });
});

it('checks configuration without exposing keys or issuing payment requests', () => {
  const result = spawnSync(process.execPath, [script], {
    env: { NODE_ENV: 'test', ...credentials },
    encoding: 'utf8',
  });
  expect(result.status).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({
    ready: true,
    mode: 'test',
    provider: 'not_checked',
  });
  for (const value of Object.values(credentials))
    expect(result.stdout).not.toContain(value);
});

it('requires a webhook secret even when API credentials are present', () => {
  const result = spawnSync(process.execPath, [script], {
    env: { NODE_ENV: 'test', ...credentials, RAZORPAY_WEBHOOK_SECRET: '' },
    encoding: 'utf8',
  });
  expect(result.status).toBe(1);
  expect(JSON.parse(result.stdout).checks.webhookSecret).toBe(false);
});

it.each([200, 401, 429])(
  'the optional provider probe is read-only and handles HTTP %s without exposing bodies',
  (status) => {
    const code = `
    process.argv.push('--provider');
    globalThis.fetch = async (url, options) => {
      if (url !== 'https://api.razorpay.com/v1/orders?count=1' || options.method !== 'GET' || options.body)
        throw new Error('Unexpected mutating request');
      return new Response('private-provider-body', { status: ${status} });
    };
    await import(${JSON.stringify(new URL('../scripts/check-payments.mjs', import.meta.url).href)});
  `;
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', code],
      { env: { NODE_ENV: 'test', ...credentials }, encoding: 'utf8' },
    );
    expect(result.status).toBe(status === 200 ? 0 : 1);
    expect(JSON.parse(result.stdout).provider).toBe(
      status === 200
        ? 'authenticated'
        : status === 401
          ? 'authentication_failed'
          : 'rate_limited',
    );
    expect(result.stdout).not.toContain('private-provider-body');
    for (const value of Object.values(credentials))
      expect(result.stdout).not.toContain(value);
  },
);

it('receipt retries require a job secret and never print its value', () => {
  const worker = fileURLToPath(
    new URL('../scripts/dispatch-receipts.mjs', import.meta.url),
  );
  const result = spawnSync(process.execPath, [worker], {
    env: { NODE_ENV: 'test' },
    encoding: 'utf8',
  });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('not configured');
});

it('receipt retries send the secret only to the local job and whitelist the response', () => {
  const code = `
    globalThis.fetch = async (url, options) => {
      if (url !== 'http://127.0.0.1:3000/api/jobs/receipts' || options.method !== 'POST' || options.headers.Authorization !== 'Bearer private-job-secret')
        throw new Error('Unexpected destination');
      return Response.json({ sent: 0, configured: true, private: 'private-provider-response' });
    };
    await import(${JSON.stringify(new URL('../scripts/dispatch-receipts.mjs', import.meta.url).href)});
  `;
  const result = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', code],
    {
      env: {
        NODE_ENV: 'test',
        JOBS_SECRET: 'private-job-secret',
        AUTH_URL: 'https://untrusted.invalid',
      },
      encoding: 'utf8',
    },
  );
  expect(result.status).toBe(0);
  expect(JSON.parse(result.stdout)).toEqual({ sent: 0, configured: true });
  expect(result.stdout + result.stderr).not.toContain('private-job-secret');
  expect(result.stdout + result.stderr).not.toContain(
    'private-provider-response',
  );
});
