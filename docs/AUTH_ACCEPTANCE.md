# Authentication release checks

Google and Resend are independent optional providers. Google requires AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET; email requires AUTH_RESEND_KEY and a verified AUTH_EMAIL_FROM. Both use the existing AUTH_SECRET, AUTH_URL and PostgreSQL database. Never rotate AUTH_SECRET during ordinary deployment. Do not publish provider secrets or session cookies.

## Live-domain setup

Public URL: https://learndatastructureandalgorithms.divyrs.com

Google authorized JavaScript origin: the public URL above. Authorized redirect URI: https://learndatastructureandalgorithms.divyrs.com/api/auth/callback/google. Add intended testers in Google Auth Platform while the application is in testing mode. The Google button requests account selection explicitly. Existing accounts should use their original login method if Google reports an account-linking conflict; email matching alone is not a reason to disable provider account-linking protections.

Resend must have a valid API key and verified sender domain. Configure SPF/DKIM according to Resend's dashboard. Email links must use the HTTPS public domain. Recreate the app container after editing .env; a source rebuild is unnecessary for credential changes. Google and Resend buttons only appear when their corresponding settings are present.

## Non-destructive live acceptance

Use a dedicated test account, never delete the owner's admin account or change its session expiry.

1. Open /sign-in in an incognito window. Confirm both configured provider buttons appear.
2. Sign in with Google. Confirm the account chooser, return to /learn, and My account navigation. Verify the displayed email under /account.
3. Sign out. Confirm /account redirects to /sign-in; /api/session-state returns {"owner":null}; browser notes/reviews from the signed-in account no longer appear.
4. Sign in as a second Google test user. Confirm the displayed email changes and the prior account's notes, bookmarks, progress and paid access do not carry over. Switch back and verify server-saved data remain with the original user.
5. In a separate incognito profile, request an email link to a dedicated accessible mailbox. Confirm delivery and the correct HTTPS hostname, then use the link once. Request a new link before retesting; previously consumed tokens must not create another session.
6. Confirm /api/auth/providers lists google and resend without showing secrets. Confirm /api/auth/session and /api/session-state responses are not cached.
7. Session-expiry rejection and session revocation are exercised with isolated database fixtures in tests/e2e/auth.spec.ts. Do not expire real user sessions to simulate this on production.

Record the time, deployed commit, browser, provider and pass/fail result. Automated database-session fixtures do not establish Google consent, live email delivery, DNS, HTTPS, or provider acceptance.

## Current evidence and limits

The owner reports Google login and manual admin access working. Resend delivery is now confirmed by its Delivered event and the recipient finding the message in Gmail Spam. The verified sending domain is learndatastructureandalgorithms.divyrs.com and the configured sender matches it. Clicking the email link currently produces a Verification error, so email login acceptance is still open. Existing live logs collapse the error category; deploy the safe diagnostics before diagnosing token consumption or expiry. This execution environment has no VPS access or live provider credentials, and its proxy rejected the public domain with CONNECT 403.

## Automated release evidence (2026-10-17)

497 tests pass, including real Auth.js email callback expiry/replay and browser identity quarantine tests. Six desktop/mobile browser scenarios verify database session expiry, confirmed logout and account isolation. Production build, types, lint and formatting pass. The full browser suite passed 49/50 initially; the Cloud capstone input check passed on isolated retry. No real email, Google consent flow or production session was used for these fixtures. The public-domain network check remained blocked by this environment's proxy.

## Diagnosing a delivered email whose link fails

Delivery does not prove that the callback succeeded. After deploying the diagnostic logger, reproduce with one fresh email and inspect only categorical auth_failure records:

- authType=Verification, verification=token_not_found: no matching single-use token was found. Prior consumption, a changed secret, altered URL parameters, or different backing storage can cause this. Do not assume a mail scanner is responsible.
- authType=Verification, verification=token_expired: the matched token expired according to the application clock.
- authType=AdapterError: inspect database availability and migrations without dumping adapter error objects or connection strings.

No token values, addresses, callback URLs or credentials are recorded. Preserve single-use behavior. A browser verification error is not evidence that the link expired; use the categorical result first. Reproduce only after the running app has been updated, without restarting or changing secrets between requesting and opening a new link.
