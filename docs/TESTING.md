# Local testing checklist

This guide describes the current implementation checkpoint. It does not certify the unfinished catalog or production release.

## Setup

Use Node.js 22 LTS (22.12 or newer patch), pnpm 10.28.2 and Docker with Compose. Follow the commands in [README](../README.md). `pnpm setup:local` generates `.env`; it never overwrites an existing file. Do not copy the placeholder password from `.env.example` over a generated `.env`.

Open http://localhost:3000 after `pnpm dev`. Keep that origin consistent with `AUTH_URL`. Free content works without Google, Resend or Razorpay keys.

## What to test without credentials

1. Open `/learn`, filter/browse tracks and modules, open Bubble Sort or Binary Search, then check light/dark themes and a 320–375px phone viewport.
2. In a free lesson, play/pause, change speed, step forward/back, restart and scrub to the end. Change between four code languages and inspect variables/counters. Try presets, random inputs and a valid custom input, then an invalid one.
3. Switch to Try mode. Give a wrong answer, request a hint and then give the correct answer. Check quiz feedback, completion, XP and the anonymous dashboard. Refresh and check saved progress, bookmarks and notes. Exact input/frame resumption still needs additional implementation.
4. Test a general graph in BFS using `{"n":5,"edges":[[0,1],[0,2],[1,3]],"directed":false,"start":0}`. Vertex 4 should remain unreachable. Try a cycle and a directed graph.
5. Open `/playground`, select Bubble Sort and load `[3,1,2]`. Experiment with steps; playground runs should not complete curriculum lessons or award XP.
6. Open `/compare`. Compare Bubble, Selection and/or Insertion Sort on the same array. Scrub both traces, change speed and inspect each counter. Adding a paid sort while anonymous must display an access error.
7. Click Search or press Ctrl/Command-K. Search `track:dsa bubble`; follow the result. Reopen and press Escape; focus should return to the opener.
8. Open Merge Sort while anonymous: expect a locked preview. Confirm that `/account` redirects to sign-in and that unavailable auth providers show an honest configuration state.
9. Open `/learn/system-design/fundamentals/how-a-request-travels`, change traffic, replicas, cache target and a database failure, then Load input. Check request conservation and the AWS/GCP component labels.
10. Open `/learn/system-design/case-studies/url-shortener`. Edit capacity assumptions, step through the progressive architecture, then enable lost delete invalidation and inspect cached versus durable outcomes. Case API paths are design exercises, not live AlgoVerse routes.
11. Open the free Database keys and normalization lessons. Test duplicate primary keys, an orphan foreign key and NULL. In normalization, use attributes ABC with AB → C and C → B: candidate keys AB/AC should satisfy 3NF and fail BCNF.
12. Open the free Cloud service-model lesson, switch AWS/GCP and IaaS/PaaS/SaaS, then inspect responsibility gaps.
13. Open the free Cloud capstone. Disable app DB identity and set cache hits to zero: completions should be zero and failures visible. Set cache hits to 100%: public cached reads should complete without a DB operation. Check AWS/GCP mapping, request accounting and the progressive architecture.

## Authenticated acceptance tests

Configure Google OAuth or Resend as described in README, then restart. Register the exact Google callback URL. Do not post credentials in chat or commit them.

- Complete a free lesson anonymously, then sign in. Check that progress merges into the account and repeated sync does not duplicate XP.
- Add a note/bookmark, refresh and sign in on a second browser. Check account synchronization.
- Sign out, then use a different account. Confirm the previous account’s private learning data is not shown.
- For email, check delivery, expiry/error behavior and sign-out. Actual delivery has not been verified in this environment.

## Razorpay test-mode acceptance

Use only test-mode keys. Populate all three Razorpay settings and appropriate business details, restart, and sign in with a test account. The webhook secret must match the provider endpoint configuration.

- Buy from `/pricing` using Razorpay’s published test payment details. Confirm success only after server verification of captured payment.
- Open a paid lesson and download its private invoice from the account. Another account must not access that invoice or lesson.
- Try cancellation, failed payment, repeated verification, delayed webhook delivery and webhook retries. Retries must not grant duplicate entitlements or receipts.
- Validate coupon expiration, limits and server-calculated amounts. Abandoned payable orders retain their coupon reservation by design.
- Exercise the refund path using an explicitly provisioned admin account; confirm refund completion revokes access and a late capture cannot restore it.
- Configure Resend plus `JOBS_SECRET` to test durable receipt delivery/retries. Avoid live purchases during development.

A provider cannot deliver webhooks directly to localhost. Use a reachable HTTPS test endpoint when performing that acceptance check. Deployment setup is a separate step. Signed fixture tests passing locally do not prove actual Razorpay, Google or email integration success.

## Automated checks

Run the validation commands in README against a disposable local database. Expect the implemented-content validator to report 201 authored lessons and zero planned entries. The strict full-catalog validator must pass. This does not by itself close final production audits.

Browser suites cover desktop/mobile, accessibility scans on sampled pages, anonymous account merging, protected content/invoices, signed webhook idempotency, playback, search, playground isolation and comparison gating. A passing accessibility sample does not establish full-site WCAG conformance. Lighthouse and full production-hardening acceptance still remain.

## Troubleshooting

- Port 5432/6379 already occupied: stop the conflicting local database/cache or update both Compose mappings and `.env` consistently.
- Authentication origin errors: use the origin in `AUTH_URL`; restart after editing `.env`.
- Database connection errors: run `docker compose ps` and `pnpm db:migrate`; do not delete database volumes merely to resolve a password mismatch.
- Prisma client missing: run `pnpm db:generate` after installing dependencies.
- Browser checks conflict with development: stop `pnpm dev`; build before running Playwright.
- Missing provider keys: free lessons still work; sign-in/purchase testing requires your own test-provider configuration.
