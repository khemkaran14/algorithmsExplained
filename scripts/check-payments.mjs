// Read-only diagnostics. Never print keys, signatures, orders or provider bodies.
const key = process.env.RAZORPAY_KEY_ID ?? '';
const secret = process.env.RAZORPAY_KEY_SECRET ?? '';
const mode = /^rzp_test_[a-zA-Z0-9]+$/.test(key)
  ? 'test'
  : /^rzp_live_[a-zA-Z0-9]+$/.test(key)
    ? 'live'
    : 'unconfigured';
const checks = {
  keyId: mode !== 'unconfigured',
  keySecret: Boolean(secret.trim()),
  webhookSecret: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET?.trim()),
};
const ready = Object.values(checks).every(Boolean);
const report = {
  ready,
  mode,
  checks,
  receiptsConfigured: Boolean(
    process.env.AUTH_RESEND_KEY && process.env.AUTH_EMAIL_FROM,
  ),
  receiptRetriesConfigured: Boolean(process.env.JOBS_SECRET),
  provider: 'not_checked',
};
if (process.argv.includes('--provider') && ready) {
  try {
    const response = await fetch('https://api.razorpay.com/v1/orders?count=1', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,
      },
      signal: AbortSignal.timeout(10000),
      redirect: 'error',
      cache: 'no-store',
    });
    report.provider = response.ok
      ? 'authenticated'
      : [401, 403].includes(response.status)
        ? 'authentication_failed'
        : response.status === 429
          ? 'rate_limited'
          : 'unavailable';
    await response.body?.cancel();
  } catch {
    report.provider = 'unreachable';
  }
}
console.log(JSON.stringify(report, null, 2));
if (
  !ready ||
  (process.argv.includes('--provider') && report.provider !== 'authenticated')
)
  process.exitCode = 1;
