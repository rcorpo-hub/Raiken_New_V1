# Owner workspace setup

The implementation runs at `/admin` alongside the existing public website. The hosted Supabase project and first real owner account are intentionally deferred until the user is ready. Local verification uses synthetic accounts and records only.

## What is available

- Authenticated dashboard, submission review/status/notes, immutable original answers and encrypted correction history.
- Client profiles, preferred-time appointment requests, private verified-document downloads, current operational counts and activity history.
- Draft/publish website wording for home/service panels, contact/office details, team and footer; new text pages and blog posts; immutable published revisions and restore-as-new-version editing.
- Managed forms with text, email, phone, number, date, paragraph, choice and checkbox fields. New forms appear in their selected service category.
- Owner-managed staff permissions and office assignments. Application endpoints and database policies enforce those grants; client-side navigation is not the authorization boundary.

## Local setup

Prerequisites: Node 22 or newer, pnpm, Supabase CLI and Docker Desktop. Keep Docker running. Do not reset a database that contains records you need.

```powershell
pnpm install --frozen-lockfile
supabase start
supabase migration up --local
```

Copy `.env.example` to the ignored `.env.local`. Read the local project URL and keys privately from Supabase; do not paste credentials into chat or commit them. Configure the public URL/anon key, server-only service-role key and `NEXT_PUBLIC_APP_URL=http://localhost:3000`. Generate a random 32-byte encryption key, represented as 64 hex characters, and save it directly to `.env.local` and a protected backup. Never use zeros or reuse a test key for production. All three server settings must belong to this same local project.

```powershell
node --env-file=.env.local scripts/seed-workspace.mjs
pnpm dev
```

The seed is idempotent: it registers 24 intake destinations, current public content and private storage buckets. It does not create accounts or import client records. `/nc` remains a conveyancing gateway, not a separate intake engine. The public directory still has 24 links: 7 Personal, 7 Business, 7 Conveyancing and 3 General; the support intake is registered separately.

## Hosted Supabase project, before owner setup

1. Create the agreed Raikan Corporation project in Sydney. Confirm its project reference; retain the database password privately.
2. Use a fresh project for this application. If it already contains business data, take a backup and review all migrations first: the owner migration replaces application-table access policies. This is not an upgrade to apply blindly to an unrelated database.
3. Authenticate the CLI locally, link the exact project reference, inspect the migration list and preview the push before applying it:

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REFERENCE
supabase migration list
supabase db push --linked --dry-run
supabase db push --linked
```

Apply the original foundation migration followed by all dated owner migrations in repository order, through `20261117000006_document_verification.sql`. No manual SQL edits or schema reset are needed.

4. Fill the deployment environment with that project's URL, anon key and server-only service-role key, plus a new encryption key and the exact canonical HTTPS application URL. Set `NEXT_PUBLIC_SITE_URL` to the intended public domain. Do not carry `LOCAL_WORKSPACE_TEST=true` into the hosted environment. Never upload the local fixture file or local database.
5. In Supabase Auth, keep the **email/password provider enabled** and disable **public user signups** globally. Enable authenticator/TOTP enrollment and verification. Set a strong minimum password length (local configuration uses 12). Add only the intended `/auth/confirm` redirect URLs, including localhost only while explicitly needed for development. Local `config.toml` does not configure the hosted project's Auth settings automatically.
6. Configure and verify Auth email delivery before using staff invitations or password recovery. No submission receipt sender is enabled by this implementation. Auth invitations are a separate Supabase feature.
7. Run the seed against the intended environment using its private env file. Confirm both `quarantine-uploads` and `verified-documents` remain **private**. The application serves verified downloads through permission-checked, audited, short-lived URLs.

## First real owner — final step

The owner email has not been selected or provisioned yet, as requested.

1. Confirm the exact owner email with the user.
2. Create and confirm that email's account in Supabase Auth using a private password or the configured invitation flow. Do not send a password through chat.
3. Grant the initial owner through the server-only bootstrap script:

```powershell
node --env-file=.env.local scripts/bootstrap-owner.mjs --email=OWNER_EMAIL_HERE
```

The script requires an existing confirmed Auth account. The database permits one initial owner; it does not silently replace a different owner, create a public admin signup or accept a role from Auth user metadata.

4. Sign in at `/admin/login`, enroll a real authenticator and verify a code. Private application data requires an AAL2 session even if someone calls REST/RPC endpoints directly.
5. Check the owner can receive a synthetic form, review it, publish approved wording and sign out. Rehearse owner recovery privately before real client intake. Document responsibility for the Supabase account, authenticator recovery and encryption key backup.

## Repeatable local checks

These tests mutate data and staff grants, and are guarded to **only** accept a synthetic local Supabase URL at port 54321 and `LOCAL_WORKSPACE_TEST=true`. Never point them at a hosted database.

```powershell
pnpm exec playwright install chromium
pnpm test:workspace:prepare
pnpm build
pnpm start
# In a second terminal, while the app runs on localhost:3000:
pnpm test:workspace
```

For an already installed compatible Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable. Fixture credentials and authenticator secrets are created only in ignored `.diagnostics/owner-workspace-fixtures.json`; do not open, share or commit it. Test output and screenshots go to ignored `.diagnostics/workspace-evidence/`. Public visibility is removed from test-created custom forms/pages after the run, while synthetic submissions/history are retained in the local database. The fixtures script aborts if a different initial owner already exists.

## Before accepting real clients

This local build is not a production launch approval. Connect hosted Auth/storage, verify backup and recovery, replace test credentials, review actual workflows and exercise the important negative access cases on staging. Configure a quarantine upload/verification/scanning pipeline before collecting new attachments. No scanner is bundled, and new metadata defaults to pending. Existing complex forms retain their original user interface until individually reviewed: the managed editor does not yet implement conditional/repeatable sections, signatures, calculations or upload fields. Do not publish an extracted replacement without confirming every required behavior. Appointment requests do not reserve calendar availability. Legal/retention wording and any legacy import need the client's decision.
