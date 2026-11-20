# Unified conveyancing form and LiveSign setup

Implemented locally. No GitHub push or deployment was requested.
Reference: [rcorpo-hub/conveyancing-form](https://github.com/rcorpo-hub/conveyancing-form/tree/5392d09).

## Behaviour

- /nc is the combined individual purchaser/vendor form: up to six people,
  conditional questions, review, drawn/uploaded signature and receipt.
- Company / Trust retains the contact-the-firm instruction. There is no office
  selector; submissions retain the existing internal Adelaide assignment.
- /nc/i-am-purchaser and /nc/i-am-vendor return 404, without redirects.
  The older Buyer, Vendor Sales and Residential Property forms are now retired as part of the approved twelve-form public menu. The owner approved deletion of the synthetic local records.
- Answers and drafts are encrypted in Supabase. Drafts have an unguessable
  HttpOnly cookie, expire after 24 hours and are cleared on submission. No
  personal data is stored in localStorage or tracking cookies.
- The current reference UI collects a signature image, not separate ID or
  source-of-funds attachments. Identity evidence is collected through LiveSign.
  Signatures are normalised to bounded PNG images and encrypted with answers.
  This does not introduce an unscanned identity-document upload endpoint.
- LiveSign mapping preserves one envelope per matter, one customer per person,
  AccountHolderPays, email invitation, AMLWithVoi, PEP and AML fields.
  Create/start follows the supplied integration. Website code does not collect
  payment or approve matters. Billing timing and account-specific approvals
  must be confirmed inside LiveSign.
- The dashboard shows completed answers, signature, per-person identity results,
  provider matter status, separate AML status/risk and last successful sync.
  Staff review notes/statuses are internal and do not change provider results.
- Answer correction is disabled for all submissions in UI, API and database RPC.
  Historical corrections stay readable. Ordinary CMS/form editing remains;
  this dedicated workflow's essential verification questions are protected.

## Database and processing

Apply all twelve migrations through 20261119000001_delete_unused_forms.sql in order.
It registers conveyancing-intake, archives the two retired forms, and adds
shared sessions, cases, people, jobs and event tables. There is no table per
submission. Existing submissions remain intact. Run the existing seed after
migrations; it skips retired and dedicated forms.

Acceptance, people and initial send job commit in one transaction. Session UUIDs
deduplicate concurrent/repeated submissions. Different answers with the same
session conflict. Database failures do not produce success receipts.

The persisted worker uses row leases and records create/start intent before
provider calls. Uncertain writes are held for reconciliation. Confirm the existing
request in LiveSign before considering a resend; never blindly reset a held paid
request. Recovery after a database failure searches by exact matter reference.

Private reads require existing MFA, submission permission and office access.
Webhooks require the configured secret and only wake a job. The worker re-reads
LiveSign rather than trusting callback verdicts. Identity completion does not
finalise AML. Polling continues until both are final, with a 30-day stale-work flag.

Notifications use deduplicated jobs. SMTP acceptance is not proof of inbox
delivery. Uncertain SMTP sends are held for review; missing configuration is
visible and retried within bounded limits.

## Hosted setup after the new Supabase project is supplied

1. Apply all migrations, run the seed and finish the existing owner-workspace
   setup. Use a new production encryption key. Keep local fixtures, credentials
   and synthetic records out of the hosted project.
2. Configure the new Supabase URL, public key, server-only service-role/secret
   key and encryption key privately in .env.local and Vercel environment
   settings. Set NEXT_PUBLIC_APP_URL and NEXT_PUBLIC_SITE_URL to the canonical
   HTTPS origin. Connecting GitHub to Vercel does not create database tables.
3. Add the existing account's LIVESIGN_API_KEY and LIVESIGN_PARTNER_ID privately.
   Generate a random LIVESIGN_WEBHOOK_SECRET of at least 32 characters.
   Defaults retained from the source: LIVESIGN_BASE_URL=https://api.web.live-sign.com,
   LIVESIGN_PRODUCT_PACKAGE=AMLWithVoi, LIVESIGN_VOI_PRODUCT_ID=1 and
   LIVESIGN_TIMEZONE=Cen. Australia Standard Time. Change these only to the
   account's approved configuration. Partner IDs are not guessed from other matters.
4. Keep LIVESIGN_MODE=disabled and CONVEYANCING_EMAIL_ENABLED=false during setup.
   Adding credentials or deploying does not automatically enable real sends.
5. Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM and
   comma-separated FIRM_EMAIL. This form uses one firm recipient list.
6. Generate a separate random CRON_SECRET of at least 32 characters. Set up a
   one-minute authenticated POST to /api/conveyancing/worker with the
   Authorization header containing Bearer followed by that secret.
   The optional template supabase/setup/conveyancing-scheduler.sql uses Supabase
   Cron and Vault. Create its two Vault secrets privately, then execute it in
   the intended hosted project. It has not been activated locally.
   [Cron quickstart](https://supabase.com/docs/guides/cron/quickstart),
   [Vault scheduling pattern](https://supabase.com/docs/guides/functions/schedule-functions).
7. Check the scheduler reaches the intended deployment and receives the disabled
   response. Protected Vercel previews need explicitly configured scheduler and
   callback access. Configure this before accepting real clients.
8. Requests automatically include the HTTPS callback at
   /api/conveyancing/livesign/webhook with its secret token. Ensure LiveSign can
   reach it. Keep callback tokens out of screenshots, logs and handover messages.
9. After account settings, routing, owner approvals and launch are checked and
   authorised, enable LIVESIGN_MODE=live and CONVEYANCING_EMAIL_ENABLED=true in
   the intended environment. Genuine submissions can then create/start requests.
   No sandbox exists and no real test submission was sent during implementation.
10. Pushes and deployment require the user's explicit request. Local changes
    appear in Vercel only after approved code is pushed and deployed. Preview
    and restored test projects must use their own environments and secrets.

## Verification and limits

Run npm run test:conveyancing with the existing synthetic local Supabase workspace
and QA accounts. OWNER_WORKSPACE_FIXTURES can reference an existing private test
fixture directly; do not copy login/MFA credentials. The suite refuses a hosted
database, disables real sends, blocks external fetches and injects simulated
provider/mail transports. Created jobs are stopped after testing so synthetic
records cannot be sent later when live mode is enabled.

Executed results: conveyancing-results.json. Screenshots stay in ignored
.diagnostics/conveyancing. Simulation does not prove live delivery, billing,
account approvals, hosted scheduling, protected callbacks or real credentials.
Standalone historical data has not been imported. Existing question/declaration
and stamp-duty wording is retained without claiming legal approval.

## Participant restoration fix

The editable setup now mounts after its saved draft has loaded. Restored buyer/seller and participant choices initialise together, so a default one-person setup cannot replace a saved group or overwrite newer choices. Failed initial loads display a retry action instead of collecting unsaved answers. Each person's controls have their own component identity, keeping names, dates and addresses separate when navigating between people. Saved-draft requests have bounded timeouts and expose safe save-error messages.

Run npm run test:conveyancing:people for five simulated browser regressions covering restored two/three-person buyers and sellers, increasing the count, going back and retrying failed restoration. The integration suite also completes two- and three-person buyer/seller journeys into encrypted local receipts and checks every person's saved name/date. See conveyancing-people-results.json and conveyancing-results.json. Docker Desktop must be running for local Supabase autosave; its stopped engine caused the observed local save error.

## Local startup dependency

Use npm run preview:local after a Windows restart or when local services have been closed. The launcher waits for the existing Supabase database and authentication service before opening the website, and holds the Docker startup process in the running preview session. Its local-only guard refuses hosted Supabase URLs and forces LiveSign/email off. Database files, schema, accounts and credentials are not recreated or copied. Docker and the terminal must stay running during local use; the hosted deployment will use the independent hosted project instead.
