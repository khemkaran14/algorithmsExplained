import 'server-only';
import pino from 'pino';
import { authFailureDetails } from './auth-diagnostics';
const sink = pino({ base: undefined, level: 'info' });

export function logVerificationFailure(
  verification: 'token_not_found' | 'token_expired',
) {
  sink.error(
    {
      event: 'auth_failure',
      kind: 'Error',
      authType: 'Verification',
      verification,
    },
    'Application operation failed',
  );
}
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
  sink.error(
    {
      event,
      kind,
      ...(event === 'auth_failure' ? authFailureDetails(error) : {}),
    },
    'Application operation failed',
  );
}
