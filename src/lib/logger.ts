import 'server-only';
import pino from 'pino';
const sink = pino({ base: undefined, level: 'info' });
/** Accept only fixed event names and coarse categories; never pass requests or Error objects. */
export function logFailure(
  event: 'api_failure' | 'auth_failure' | 'auth_warning' | 'job_failure',
  error?: unknown,
) {
  const kind =
    error instanceof TypeError
      ? 'TypeError'
      : error instanceof RangeError
        ? 'RangeError'
        : 'Error';
  sink.error({ event, kind }, 'Application operation failed');
}
