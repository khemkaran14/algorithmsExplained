import { expect, it } from 'vitest';
import { authFailureDetails } from '@/lib/auth-diagnostics';

it.each([
  [{ hasInvite: false, expired: false }, 'token_not_found'],
  [{ hasInvite: true, expired: true }, 'token_expired'],
  [{ hasInvite: true, expired: false }, 'identifier_mismatch'],
])(
  'classifies verification failures without including sensitive values',
  (cause, verification) => {
    const error = Object.assign(new Error('private sign-in URL and token'), {
      type: 'Verification',
      cause: { ...cause, email: 'private@example.com', token: 'private-token' },
    });
    expect(authFailureDetails(error)).toEqual({
      authType: 'Verification',
      verification,
    });
  },
);

it('drops unrecognized error types, messages and causes', () => {
  const error = Object.assign(new Error('private-token'), {
    type: 'private-token',
    cause: { token: 'private-token' },
  });
  expect(authFailureDetails(error)).toEqual({ authType: 'OtherAuthError' });
  expect(authFailureDetails({ type: 'Verification' })).toEqual({
    authType: 'OtherAuthError',
  });
});

it('does not infer verification details from malformed flags', () => {
  const error = Object.assign(new Error('private-token'), {
    type: 'Verification',
    cause: { hasInvite: 'false', expired: 'true' },
  });
  expect(authFailureDetails(error)).toEqual({ authType: 'Verification' });
});

it('reports an allowed adapter category without serializing its cause', () => {
  const error = Object.assign(new Error('postgresql://private-credentials'), {
    type: 'AdapterError',
    cause: { err: new Error('private database query') },
  });
  expect(authFailureDetails(error)).toEqual({ authType: 'AdapterError' });
});
