import { db } from '@/lib/db';
import { json } from '@/lib/http';
import { admitRequest } from '@/security/rate-limit';
export const dynamic = 'force-dynamic';
type Health = {
  status: 'ok' | 'unavailable';
  checks: {
    database: 'ok' | 'unavailable';
    requestProtection: 'shared' | 'local-preview' | 'unavailable';
  };
};
let cached: { expires: number; value: Health } | undefined,
  pending: Promise<Health> | undefined;
async function check(): Promise<Health> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Readiness timeout')), 2000);
    });
    const database = Promise.race([
      Promise.resolve().then(() => db.$queryRaw`SELECT 1`),
      timeout,
    ]);
    const [dbStatus, limiter] = await Promise.allSettled([
      database,
      admitRequest('readiness', {
        scope: 'health-probe',
        limit: 1000,
        windowSec: 60,
      }),
    ]);
    const checks: Health['checks'] = {
      database: dbStatus.status === 'fulfilled' ? 'ok' : 'unavailable',
      requestProtection:
        limiter.status === 'fulfilled' && limiter.value.allowed
          ? limiter.value.store === 'redis'
            ? 'shared'
            : 'local-preview'
          : 'unavailable',
    };
    return {
      status:
        checks.database === 'ok' && checks.requestProtection !== 'unavailable'
          ? 'ok'
          : 'unavailable',
      checks,
    };
  } finally {
    clearTimeout(timer);
  }
}
export async function GET() {
  if (!cached || cached.expires <= Date.now()) {
    pending ??= check()
      .then((value) => {
        cached = { expires: Date.now() + 5000, value };
        return value;
      })
      .finally(() => {
        pending = undefined;
      });
    await pending;
  }
  return json(cached!.value, cached!.value.status === 'ok' ? 200 : 503);
}
