# Administration and entitlement-aware lesson tiles

## Features

/admin lists searchable accounts and payments with stable pagination (25 records per page). Search matches account names, account email, payment email, Razorpay IDs, receipts and coupon codes. Account rows link to /admin/users/<id> for a detailed profile. The Admin navigation link appears only for a freshly authorized administrator.

Profiles show account ID, name, login email, role, recorded email-verification date, linked provider names, active five-year grants, learning activity counts and paginated payment history. Payment history includes captured checkout email, amount/currency, status, provider order/payment IDs, dates and receipt-delivery state. No sign-in credentials, session tokens, OAuth tokens, card details or note contents are exposed.

Every admin page rechecks the stored administrator role before querying private profile details. Demoting an administrator takes effect on the next request. Normal users cannot read another user's admin profile by guessing its URL.

Five-year users see an included-access indicator instead of a lock on paid tiles across /learn, /account, track/module catalogs and guided paths. Free lessons retain their Free badge. Revoked grants no longer count as active. The badges do not authorize lesson access; protected loaders and APIs still perform independent checks.

## Payment email availability and privacy

Login email and checkout email are separate fields and can differ. Payment email is recorded only from a trusted captured Razorpay response/webhook. Invalid or absent optional email data does not block payment capture. Older payments show Not recorded; no mailbox is invented or inferred from a login email. No historical provider backfill runs automatically. On an older captured payment with a Razorpay payment ID, use Retrieve payment email from Razorpay in its user profile. This performs a read-only provider lookup, checks the stored order/amount/currency, and stores only a matching email. Use the keys for that payment’s test/live environment; no charge or refund is made. Deleted accounts cannot be repopulated through this action.

Payment email is included in the owner's account export and removed on account deletion. A late captured webhook cannot restore that deleted account's checkout email. Retained payment references remain available for financial reconciliation.

## VPS rollout: migration required

This release adds the nullable Payment.paymentEmail column. Apply the migration before starting the updated app. Preserve the existing .env, database volume and Compose project.

1. Back up the database:

```bash
install -d -m 700 /root/algoverse/backups
umask 077
docker compose -f /root/algoverse/compose.yml --env-file /root/algoverse/app/.env exec -T postgres pg_dump -U algoverse -d algoverse -Fc > "/root/algoverse/backups/before-admin-$(date +%Y%m%d-%H%M%S).dump"
```

2. Pull the update and build the migration tools image:

```bash
cd /root/algoverse/app
git pull --ff-only
docker build --target build -t learning-app-tools:local .
```

3. Apply migrations using the host database URL in .env (127.0.0.1:55432 or localhost:55432 on this VPS):

```bash
docker run --rm --network host --env-file /root/algoverse/app/.env learning-app-tools:local pnpm db:migrate
```

Stop if migration fails; do not use db:push or delete volumes as a workaround.

4. Update only the app:

```bash
docker compose -f /root/algoverse/compose.yml --env-file /root/algoverse/app/.env up -d --no-deps --build app
```

5. Sign in with the existing admin account and open /admin. Search a login email, click the account row, and inspect its profile. Check a five-year account's tiles at /learn/dsa and /learn. New captured test payments can verify checkout-email recording. Never issue a real payment merely to test the new display.

## Verification (2026-10-18)

The additive migration applies in the development database. 517 automated tests and all 54 desktop/mobile browser scenarios pass, along with production compilation, type checking, lint and formatting. Tests verify badges on all five catalog surfaces, revocation, admin/non-admin access, search by separate payer email, token non-disclosure, matched historical lookup and privacy after account deletion/late capture. Automated provider lookups use fixtures, not live merchant credentials.

For signup dates, expiry enforcement and the latest required migration, see [Five-year access and SEO rollout](FIVE_YEAR_ACCESS_AND_SEO.md). Revoked or expired grants no longer unlock paid tiles.
