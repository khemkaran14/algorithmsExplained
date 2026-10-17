/** Fixed categories only: never expose messages, tokens, URLs, emails or stacks. */
const types = new Set([
  'Verification',
  'AdapterError',
  'MissingSecret',
  'UntrustedHost',
  'EmailSignInError',
  'CallbackRouteError',
  'OAuthAccountNotLinked',
  'OAuthCallbackError',
  'AccessDenied',
  'MissingCSRF',
  'Configuration',
]);

export function authFailureDetails(error: unknown): {
  authType: string;
  verification?: 'token_not_found' | 'token_expired' | 'identifier_mismatch';
} {
  if (!(error instanceof Error)) return { authType: 'OtherAuthError' };
  const type: unknown = 'type' in error ? error.type : undefined;
  const authType =
    typeof type === 'string' && types.has(type) ? type : 'OtherAuthError';
  if (authType !== 'Verification') return { authType };
  const cause = error.cause;
  if (!cause || typeof cause !== 'object' || !('hasInvite' in cause))
    return { authType };
  if (cause.hasInvite === false)
    return { authType, verification: 'token_not_found' };
  if (cause.hasInvite === true && 'expired' in cause) {
    if (cause.expired === true)
      return { authType, verification: 'token_expired' };
    if (cause.expired === false)
      return { authType, verification: 'identifier_mismatch' };
  }
  return { authType };
}
