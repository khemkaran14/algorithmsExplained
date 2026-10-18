# Five-year access, account dates and public pages

All Access now means a one-time five-calendar-year term, currently INR 199.
There is no recurring billing or Razorpay Subscription. After expiry the user
sees a renewal link and can buy a fresh term at the then-displayed price.
No expiry cron is needed: every paid authorization checks expiresAt > now.
Payment replays never extend the grant. Refunds remain terminal.

## Existing data

Migration `20261018120000_five_year_access` adds nullable User.createdAt with a
creation-time default for future users. Existing signup dates remain unknown,
shown as Not recorded; payment dates must not be used as fabricated signup dates.
Existing entitlement expiry is original grantedAt plus five calendar years,
including manual grants. It does not start a fresh term at deployment.
Admin role and access to the admin portal are independent of paid lesson access.
The owner requested this conversion of existing lifetime-labelled access.
Communicate the changed terms to affected customers and address prior promises
and mandatory consumer rights before accepting live purchases.

Admin overview shows signup and payment dates in UTC; detail pages include full
payment timestamps and active grant end times. Account export includes signup
and grant expiry. Accounts show the term end and payment date. Invoices and
receipts describe the five-year term.

## Public pages and search

Canonical public origin is SITE_URL, defaulting to the existing public domain:
https://learndatastructureandalgorithms.divyrs.com
Set this explicitly in the VPS .env. It must contain only an HTTP(S) origin.
Canonical URLs never come from request Host headers. Auth callback origin remains
AUTH_URL and should match SITE_URL in production.

The release adds robots.txt, sitemap.xml, a branded Open Graph PNG, an SVG icon,
WebSite JSON-LD, canonical URLs and per-page catalog metadata. The sitemap uses
public catalog metadata only. It contains authored lesson landing URLs, not paid
lesson bodies. There is no crawler bypass of entitlement checks. Private/API/auth
responses carry X-Robots-Tag: noindex, nofollow, noarchive and are excluded from
the sitemap. robots.txt is crawl guidance, not authorization.

Privacy, terms, refund, digital delivery, cookie, contact and about pages are
linked in the footer. Refund policy adopts a seven-day request window for
specified purchase/access problems, without excluding mandatory rights.
Policies disclose the actual implemented account deletion and payment retention
behavior. There is no invented business address, jurisdiction or response SLA.

Set these public values in /root/algoverse/app/.env:

```dotenv
SITE_URL=https://learndatastructureandalgorithms.divyrs.com
BUSINESS_NAME=your legal operating name
BUSINESS_EMAIL=your public support address
BUSINESS_ADDRESS=your public business address
BUSINESS_JURISDICTION=your applicable jurisdiction
```

Use a monitored mailbox for BUSINESS_EMAIL; an outbound-only login sender is not
a support inbox. The support address is required to make the public support/refund/privacy process
usable. If omitted, pages explicitly say that the contact is unpublished.
Review the operator information and policy applicability before live payments.
This implementation does not certify legal compliance or guarantee search rank.

## Existing VPS deployment

Do not stop the existing database or other apps. Back up before migrating:

```bash
install -d -m 700 /root/algoverse/backups
umask 077
docker compose -f /root/algoverse/compose.yml --env-file /root/algoverse/app/.env exec -T postgres pg_dump -U algoverse -d algoverse -Fc > "/root/algoverse/backups/before-five-year-$(date +%Y%m%d-%H%M%S).dump"
cd /root/algoverse/app
git pull --ff-only
# Edit the public business fields above in .env, preserving provider secrets.
nano /root/algoverse/app/.env
docker build --target build -t learning-app-tools:local .
docker run --rm --network host --env-file /root/algoverse/app/.env learning-app-tools:local pnpm db:migrate
docker compose -f /root/algoverse/compose.yml --env-file /root/algoverse/app/.env up -d --no-deps --build app
```

Only start the new app after migration succeeds. Backfilled expired grants stop
unlocking paid lessons. Never reset the database or delete its volume. Old app
versions ignore expiry, so rolling back app code alone would remove enforcement.

## Acceptance on the VPS

- Sign in as admin; check a new user's Joined date, an older user's Not recorded
  signup date, and captured payment dates. Confirm UTC labels.
- Use Razorpay test mode to confirm checkout, invoice and receipt wording. The
  account must show the expiry five years from the grant; reopening a captured
  confirmation must not change it.
- Expiry and renewal are covered by isolated fixture tests. Do not alter a real
  customer's date to test expiry on production.
- Open /privacy, /terms, /refunds, /shipping, /cookies, /about and /contact. Confirm
  your public details and support mail link. Check the footer on mobile.
- Open /robots.txt, /sitemap.xml and /opengraph-image. Inspect a lesson's canonical,
  description and share tags. No private URLs should appear in the sitemap.
- Inspect /account or /api/access response headers for X-Robots-Tag. Anonymous
  users must still be unable to read paid frames or admin data.
- Fix the previously deferred HTTPS warning before real payments. Then verify
  the domain in Google Search Console/Bing Webmaster Tools, submit /sitemap.xml
  and request indexing for the homepage. Search engines decide indexing timing.

## Release validation

Validated locally on 18 October 2026: 522 unit/integration tests across 61 files,
all 56 desktop/mobile browser tests with the normal parallel settings, production
build, lint, type checking and formatting. The migration was applied and rerun
successfully against the local development database. Isolated migration tests
verify historical dates, and payment tests verify exclusive expiry, leap-day
anniversaries, renewal and replay safety. Browser tests verify policy pages,
canonical metadata, crawler files, share image, private-route indexing headers,
admin access and expiry relocking. Live VPS rollout, provider acceptance and
search-engine verification remain operator actions; these results do not claim
that the VPS has been updated.
