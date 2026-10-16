export function telemetryOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.origin
      : null;
  } catch {
    return null;
  }
}
export function contentSecurityPolicy(nonce: string, development = false) {
  const connect = new Set(["'self'", 'https://*.razorpay.com']);
  const sentry = telemetryOrigin(process.env.NEXT_PUBLIC_SENTRY_DSN),
    posthog = telemetryOrigin(process.env.NEXT_PUBLIC_POSTHOG_HOST);
  if (sentry) connect.add(sentry);
  if (posthog) connect.add(posthog);
  if (development) {
    connect.add('ws:');
    connect.add('http://localhost:*');
  }
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://checkout.razorpay.com${development ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.razorpay.com",
    "font-src 'self' data:",
    `connect-src ${[...connect].join(' ')}`,
    'frame-src https://*.razorpay.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join('; ');
}
export function applySecurityHeaders(
  headers: Headers,
  csp: string,
  secure: boolean,
) {
  headers.set('Content-Security-Policy', csp);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  if (secure)
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
}
