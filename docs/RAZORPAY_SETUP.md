# Razorpay setup on the existing Hostinger VPS

Use Test Mode first. Current price is INR 199 (19900 paise), one-time lifetime access. This guide configures the existing integration; automated fixtures do not prove real provider acceptance.

## 1. Dashboard and environment

In Razorpay, switch to Test Mode, generate API keys under Account & Settings → API Keys, and add the following names to /root/algoverse/app/.env with your own values:

```dotenv
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_SEPARATE_WEBHOOK_SECRET
JOBS_SECRET=YOUR_SEPARATE_RECEIPT_JOB_SECRET
```

These are placeholders, not working credentials. Keep all secrets on the VPS and never paste them into chat or commit .env. Choose independent long random webhook/job secrets. Preserve existing login, database and Resend settings. The API key secret and webhook secret are different values.

In Test Mode, create an enabled webhook at:

```text
https://learndatastructureandalgorithms.divyrs.com/api/webhooks/razorpay
```

Set its signing secret to exactly RAZORPAY_WEBHOOK_SECRET and subscribe to payment.captured, payment.failed and refund.processed. Configure automatic capture in Razorpay's payment-capture settings; authorized-only payments must not unlock lessons. The app independently checks captured status, order, amount, currency and signatures.

Use a valid public HTTPS endpoint. Resolve certificate warnings before sharing payment checkout publicly. Keep current Nginx routing and other websites intact. Do not add HTTP Basic authentication to the webhook path.

## 2. Deploy only this app

```bash
cd /root/algoverse/app
git pull --ff-only
docker compose -f /root/algoverse/compose.yml --env-file /root/algoverse/app/.env up -d --no-deps --build app
```

The new order endpoint refuses to create payable orders until a webhook secret is configured. A populated secret does not prove the dashboard webhook is configured correctly; test delivery below.

No database migration is required by this setup update. If only credentials change later, use up -d --no-deps --force-recreate app instead of rebuilding. Do not recreate PostgreSQL or delete volumes.

## 3. Read-only checks

```bash
docker compose -f /root/algoverse/compose.yml --env-file /root/algoverse/app/.env exec -T app node scripts/check-payments.mjs
```

Expect ready=true, mode=test, and all three required checks=true. Receipt settings are reported separately. This checks presence and key format, not provider authentication or webhook delivery.

Then authenticate the test credentials using a read-only GET request:

```bash
docker compose -f /root/algoverse/compose.yml --env-file /root/algoverse/app/.env exec -T app node scripts/check-payments.mjs --provider
```

Expect provider=authenticated. The command never creates orders, charges, refunds or sends email; it discards provider response bodies and prints no key values. authentication_failed means the key pair/permissions need correction; unreachable means network/TLS access to api.razorpay.com needs investigation. This check does not certify the webhook secret.

## 4. Test checkout using a separate account

Your admin already has manual all-access, so it cannot exercise a new purchase. Sign in with a separate test email/account without any existing entitlement.

1. Open /pricing. Confirm INR 199 and the Test checkout notice.
2. Open checkout and use Razorpay's current Test Mode simulator/test details, never real bank/card details.
3. Complete a successful simulated payment. Confirm /checkout/success eventually reports active access and a paid lesson opens for that account.
4. In Razorpay, check the payment is captured, the order amount/currency match, and the captured webhook was delivered successfully (HTTP 200).
5. Confirm /account shows the payment and a downloadable invoice. Check the receipt email, including Spam while the sender reputation is new.
6. Retry the captured webhook from Razorpay. There must still be one purchase entitlement and receipt record; delivery is idempotent.
7. Use another unpaid test account to simulate failure and cancellation. Neither should unlock lessons. A confirmed failure permits a fresh checkout attempt. Cancellation or a temporary connection problem retains the original idempotency key to avoid duplicate orders.
8. On a dedicated test purchase, issue a full test refund. Confirm refund.processed is delivered and access from that purchase is revoked. Independent manual/admin grants remain valid and must not be removed.

Do not treat opening /checkout/success or Checkout.js reporting success as proof of paid access. The server is the authority. If payment confirmation is pending, check the account/provider first instead of paying again. Arbitrary dashboard sample webhook payloads may reference unknown orders and are not a substitute for a real app-created test order.

## 5. Receipt retry job

Existing AUTH_RESEND_KEY and AUTH_EMAIL_FROM supply receipt delivery. Set JOBS_SECRET before enabling retries. Manually run the queue worker once:

```bash
docker compose -f /root/algoverse/compose.yml --env-file /root/algoverse/app/.env exec -T app node scripts/dispatch-receipts.mjs
```

This command sends due receipt emails for captured purchases. It prints only counts and keeps the job secret inside the container. For a schedule, use crontab -e and APPEND this line without removing existing jobs:

```cron
*/5 * * * * /usr/bin/docker compose -f /root/algoverse/compose.yml --env-file /root/algoverse/app/.env exec -T app node scripts/dispatch-receipts.mjs >> /var/log/algoverse-receipts.log 2>&1
```

Do not run the receipt worker as a synthetic development test against real customers. Automatic receipt dispatch also occurs when payment webhooks are processed.

## 6. Before real payments

- Complete Razorpay merchant activation/KYC and website review; confirm supported payment methods in the account.
- Review business/support, refund, privacy and terms pages. Set accurate BUSINESS_NAME, BUSINESS_EMAIL and applicable tax information. BUSINESS_GST_RATE is tax included in the configured price, not an added surcharge. Do not invent GST registration or tax rates.
- Resolve HTTPS warnings; configure shared production rate limiting, backups and monitoring.
- Keep staging/Test Mode on a separate deployment/database before opening real purchases. The current ledger has no automatic test/live environment partition: switching keys does NOT erase test payments or their entitlements. Do not accept real customers into an unreviewed test ledger or delete real orders during cleanup.
- Live Mode uses a separate key pair and separately configured live webhook/signing secret. Plan this migration after all Test Mode acceptance checks pass; never switch to live keys merely to make a failing test work.

## Acceptance record

Record deployed commit, Test Mode, payment outcome, webhook HTTP status, unlock/revoke result, invoice and receipt delivery. The initial implementation checks use isolated database fixtures/mocked Razorpay responses only. No real Razorpay checkout or dashboard configuration has been verified by the development environment.

## Development verification (2026-10-17)

514 automated tests and all 50 desktop/mobile browser checks pass, along with the production build, type checking, lint and formatting. The read-only checker runs successfully inside a Node 22 container with synthetic settings. The complete Docker image build could not pass the package download in this execution environment because registry DNS resolution fails with EAI_AGAIN. TLS verification was preserved. Verify the normal image build on the VPS; successful source compilation and the Node 22 smoke check do not substitute for a complete image build. No real merchant credentials, payment creation, refund or receipt email was used by the development tests.
