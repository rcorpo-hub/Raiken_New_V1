# Raikan Corporation — developer deployment handover

Updated 19 November 2026. The published baseline is on the staging branch of [rcorpo-hub/Raiken_New_V1](https://github.com/rcorpo-hub/Raiken_New_V1/tree/staging). The combined conveyancing/LiveSign integration and read-only-answer updates are local changes and have not been pushed. Use this prepared checkout for the current implementation until an explicit push is approved. Main remains unchanged. No hosted Supabase project or real owner account has been provisioned.

**Supabase hosts the database, authentication and private storage. It does not deploy this Next.js application by uploading the source.** The website and server API routes need a Next.js-compatible Node application host. Use separate staging and production environments. Do not replace the existing live website or change DNS during setup.

## 1. Clone staging and install

Clone the staging branch below and open its folder in your terminal. Install a compatible Node runtime (22 or newer for these scripts), pnpm and Supabase CLI. Local verification here used Node 25.2.1, pnpm 11.25.0 and Supabase CLI 2.113.0; repeat the build on the runtime supported by your deployment host.

```powershell
git clone --branch staging --single-branch https://github.com/rcorpo-hub/Raiken_New_V1.git
cd Raiken_New_V1
pnpm install --frozen-lockfile
```

Use the included lockfile. The staging branch includes frontend, Next server routes, twelve SQL migrations, setup scripts and repeatable local browser tests. It excludes `.env.local`, `.diagnostics`, local accounts/databases, dependencies and build output. Keep further changes on a feature branch; keep main untouched until review.

## 2. Create the Supabase project

Create a fresh project named **Raikan Corporation**, in **Sydney, Australia** (`ap-southeast-2`). Keep the project/database password private. Save its project reference and URL. The user has not supplied a real owner email; leave account provisioning until step 8.

Do not apply the migrations to an unrelated existing project: the owner migration replaces the app's table access policies. If a project already contains records, stop and arrange a protected backup/schema review before proceeding.

## 3. Apply the database migrations

From the project folder:

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REFERENCE
supabase migration list
supabase db push --linked --dry-run
supabase db push --linked
supabase migration list
```

Read and confirm the linked project before the push. Use the CLI's private password prompt. Apply the foundation plus all owner migrations in timestamp order; the final migration is `20261119000001_delete_unused_forms.sql`. The remote migration list must match all twelve SQL files. Do not paste fragments into SQL Editor, delete migrations, reset a populated project, or repair migration history just to suppress an error. Diagnose unexpected differences first. See [Supabase migration deployment](https://supabase.com/docs/guides/deployment/database-migrations).

## 4. Configure environment values privately

Copy `.env.example` to `.env.local`, then fill the values from this same project. For local testing against hosted Supabase, use `NEXT_PUBLIC_APP_URL=http://localhost:3000`; set it to the exact HTTPS preview/production origin when deploying. The browser must visit that exact origin for form and admin requests.

| Variable | Value / handling |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | This Supabase project's HTTPS URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key or legacy anon key; safe for the browser, RLS still applies |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret/server service-role key; keep server-only, never prefix with `NEXT_PUBLIC_` |
| `ENCRYPTION_MASTER_KEY` | New random 64-character hex key, generated below |
| `NEXT_PUBLIC_APP_URL` | Exact application origin used by the browser, without a path |
| `NEXT_PUBLIC_SITE_URL` | Intended public website origin for sitemap/canonical URLs |
| `MAIL_TRANSPORT` | Leave `capture`; submission receipt delivery is not implemented |
| `STORAGE_QUARANTINE_BUCKET` | `quarantine-uploads` |
| `STORAGE_DOCUMENTS_BUCKET` | `verified-documents` |

```powershell
node scripts/create-encryption-key.mjs
```

This writes a new key directly into the ignored `.env.local`, never prints it and refuses to overwrite an existing key. Save a protected backup. Every application instance connected to this database must use the **same** key. Generating a new key for each deployment would make existing encrypted answers unreadable. Do not copy the synthetic local test environment or enable `LOCAL_WORKSPACE_TEST` remotely. See [Supabase API key types](https://supabase.com/docs/guides/getting-started/api-keys).

## 5. Initialize content and private storage

```powershell
node --env-file=.env.local scripts/seed-workspace.mjs
node --env-file=.env.local scripts/check-workspace-config.mjs
```

Expected seed summary: **11 seeded intake registrations plus the combined conveyancing registration created by migrations, 6 editable content regions and two private buckets**. It does not create a real owner, staff or client submissions. It does not import the old website. It preserves existing registrations/content on repeat runs.

Confirm `quarantine-uploads` and `verified-documents` remain **private**; do not add public read/write policies for client documents. A configuration-check PASS is a setup diagnostic, not a replacement for hosted acceptance tests. No scanner is installed: document downloads remain blocked for pending/unverified files. Do not manually mark real uploads clean. The test suite uses explicitly synthetic verification metadata only in its isolated local database. See [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

## 6. Configure Supabase Auth

In the hosted dashboard:

1. Enable the email/password provider. Disable public user signups globally. Do not disable the email provider to prevent registration.
2. Enable authenticator/TOTP enrollment and verification. Private records require a verified AAL2 session.
3. Set the Auth Site URL to the application origin. Add the exact allowed `https://YOUR_APP_HOST/auth/confirm` URL. Add localhost only if explicitly testing locally; remove unneeded redirects before launch.
4. Set a strong password policy (local configuration uses a minimum of 12 characters).
5. Configure approved SMTP/Auth email delivery and test it before staff invitation or password recovery. Supabase Auth mail is separate from submission receipts, which are not enabled.
6. Keep Auth/database credentials and authenticator secrets in approved private storage, not chat, screenshots or Git.

The local `supabase/config.toml` does not automatically apply these settings to the hosted Auth service. See [Password authentication](https://supabase.com/docs/guides/auth/passwords) and [MFA](https://supabase.com/docs/guides/auth/auth-mfa).

## 7. Build and deploy the Next.js app to a preview host

Configure every required env value on the application host before building. Public `NEXT_PUBLIC_` values are built into the browser bundle; rebuild after changing them. Keep secret values available to the server runtime only.

```powershell
pnpm build
pnpm typecheck
pnpm start
```

For a managed Next.js host: import the feature branch/source, select Next.js, install with `pnpm install --frozen-lockfile`, build with `pnpm build`, and set the environment values above. For a Node server: run the same build and keep `pnpm start` running under a process manager behind an HTTPS reverse proxy. Do not use static HTML export or an ordinary PHP-only upload; this app uses server rendering, authenticated server routes and PostgreSQL-backed intake.

Set `NEXT_PUBLIC_APP_URL` to the stable preview origin and align Supabase Auth redirects. `/admin/login` should display the login page. `/admin` must redirect anonymous visitors to login. Public pages should preserve the redesign. Do not point DNS at the preview or enable real client intake until the hosted checks below pass.

The current intake throttle trusts Vercel's controlled forwarded-IP header only when `VERCEL=1`; on another host it uses a shared fallback bucket. Before accepting traffic on another host, implement trusted proxy IP handling for that platform and test per-client throttling. Never trust arbitrary client-supplied forwarding headers.

## 8. Create the first owner — LAST

Only now obtain the exact owner email from the user. Create and confirm that Auth account privately in Supabase, with a private password/invitation flow. Then:

```powershell
node --env-file=.env.local scripts/bootstrap-owner.mjs --email=OWNER_EMAIL_HERE
```

The script grants the first owner to an existing confirmed account only; it will not replace another owner. It does not email credentials. Sign in at `https://YOUR_APP_HOST/admin/login`, enroll the owner's real authenticator and verify a code. Verify sign-out and a fresh sign-in. Agree an account/MFA recovery process with the owner.

Future staff are invited through **People & access** after Auth mail works; they start without permissions. The owner explicitly selects actions and allowed offices. Check those permissions with a real restricted staging account, not just by inspecting hidden menu items.

## 9. Hosted acceptance and go-live decision

Use synthetic records in a separate staging project. Confirm:

- An anonymous visitor cannot read submissions, documents, drafts or admin data, or self-register an owner. A signed-in account without grants cannot enter the workspace. MFA is required.
- A public contact form produces a durable submission and matching admin record. A retry does not duplicate it; failed writes do not show a success receipt.
- The owner opens actual content/form editors, saves a private draft, publishes approved text and sees the public change. New managed forms submit into the database and keep their version. Original complex forms retain their behavior until explicitly reviewed.
- Reviews/corrections retain original submitted answers and audit history; stale edits return a refresh/conflict response.
- A restricted staff member sees only permitted offices/actions; suspension revokes access on the next request. Downloads need explicit clean verification and download permission.
- The 12 approved form destinations load: 6 Personal / 4 Business / 1 Conveyancing / 1 Appointment booking. Retired forms reject new requests; their definitions and code are deleted. All three homepage service links and both appointment URLs still work.
- Desktop, large monitor, tablet and phone layouts are reviewed. Application/database backups, encryption-key recovery, HTTPS, mail and owner recovery are rehearsed.

The local test suite is intentionally locked to local Supabase port 54321 and must not be loosened to run against a hosted/production database. See `SETUP.md` to rerun it locally, and `VERIFICATION.md` for the local evidence and limits.

**Outstanding launch work:** a real upload/quarantine/malware scanner pipeline; a full conditional/repeatable/signature/calculation form builder if needed; actual calendar availability/reservations; submission email delivery; approved legal/retention wording; and the client's decision about legacy records. The existing local core does not claim these features are complete. Retain client-named and legacy forms until their scope is approved.

## 10. Legacy records and rollback

The client still needs to decide whether to import old records. Do not access/delete the old WordPress installation or replay its notifications. Follow `LEGACY-MIGRATION.md`: protected export, source-ID mapping, staging rehearsal, reconciliation, client approval and controlled cutover. A schema is prepared for import provenance, but the importer must be built from the actual source export.

If staging fails, keep the current live website in place and restore the previous app build/environment as appropriate. Do not reset the database or rotate the encryption key to fix an application error. Production cutover and DNS changes require their own approved plan after hosted acceptance.

For the new submission category/form filters and read-only completed forms, see [Submission review](SUBMISSION-REVIEW.md).

## Conveyancing integration addendum

Follow [CONVEYANCING.md](CONVEYANCING.md) for the new database migration, private LiveSign/SMTP configuration and authenticated Supabase scheduler. Both integrations remain disabled until setup is complete. Clone/deployment instructions above apply to the updated code only after an explicitly approved push. No real verification submissions or outbound email were sent during implementation.
