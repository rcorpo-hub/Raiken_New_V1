# Owner workspace verification

This is implementation evidence for the local core, not sign-off for every item in the earlier platform planning documents. Test accounts, authenticator enrollments, submissions, pages and document metadata are synthetic and confined to local Supabase.

## Latest local result

Production build (including TypeScript) passed. All **18 browser/database checks passed** with no uncaught browser runtime errors. The production dependency audit reported **0 vulnerabilities**. The configuration helper passed against the local project. The key-generation helper passed generation, existing-key protection, export-style existing-key protection and duplicate-entry rejection checks. `local-results.json` contains the sanitized integration result. A separate empty local database also applied all eight migrations successfully: 45 application tables had RLS enabled, no initial owner was created, new files defaulted to pending, and function/policy fingerprints matched the browser-tested database. See `fresh-migration-results.json`. Hosted acceptance remains pending.

## Executed checks

The repository's `tests/owner-workspace.cjs` exercises browser -> API -> PostgreSQL, not a mock provider. See ignored `.diagnostics/workspace-evidence/results.json` from the latest run for the definitive pass/fail result and screenshots.

Coverage includes anonymous/private/draft denial; no public signup or metadata role escalation; real login and MFA with AAL1 denial; branch-scoped staff and revocation; durable encrypted intake with concurrent retry deduplication; immutable original answers and reasoned corrections; stale-edit conflict handling; private drafts and publish permissions; escaped text content; managed form creation/publication/actual browser submission/version preservation; bounded request errors; document verification/private storage/audited downloads; staff landing with limited grants; original public routes/category counts/calculator behavior; every admin section; laptop/monitor/tablet/phone overflow and mobile navigation.

## Bugs found and corrected during local verification

- Disabling the email provider alongside global public signup prevented password login. The email provider stays enabled while global public signup stays disabled.
- A stale correction used a retryable SQLSTATE and could hang. Business conflicts now use explicit PostgREST HTTP 409 errors, with a prompt to refresh.
- The foundation migration defaulted file metadata to clean. New records now default to pending; downloads require explicit verification metadata and a clean status in the private verified bucket.
- A staff member granted only content editing could reach an overview they could not use. Entry now routes to the first permitted section; no permissions means denied access.
- Visual review found that detail queries requested protected draft columns, so the editor screens failed despite successful API tests. Detail queries now select their allowed projection and use the checked draft RPC; browser checks explicitly open both editors and exercise adding/removing questions.
- TypeScript caught the narrowed-session guard after the navigation change; it was corrected before the succeeding build.

## Explicit limits

No hosted project, real owner account, production email, scanner, live legacy import, actual calendar reservation or complex conditional form-builder parity has been verified. No load or penetration-test certification is implied. The basic managed form editor and operational reports are functional but do not yet implement the full planned platform. Backup restore, recovery, staged hosted access checks and client acceptance remain prerequisites for launch.

Current conveyancing integration: production build and TypeScript passed, all 18 updated workspace regressions and 12 submission/filter regressions passed. See CONVEYANCING.md and conveyancing-results.json for the separate 12 local integration checks. Provider/email responses are simulated; real credentials, hosted setup and account-specific approval/billing are unverified. Answer correction is now intentionally disabled.


## Approved public form menu — 19 November 2026

The production build and TypeScript passed after the twelve-form menu update. All six curated-form checks and all eighteen updated owner-workspace checks passed, with no uncaught browser errors. The configuration helper passed against local Supabase. The public menu contains 6 Personal, 4 Business (Company/Trust), 1 combined Conveyancing and 1 Appointment booking form. Retired pages and /apply aliases return 404; retired submission APIs reject requests; database publication guards prevent reactivation. Both appointment URLs work and synthetic appointment submissions persist through the owner regression suite. Footer links resolve, sitemap excludes retired forms, and 390/768/1536/2553-width directory screenshots have no overflow.

Before further synthetic regression fixtures were created, all 63 historical submission records matched their pre-migration count and SHA-256 digest. Original definitions and historical records are retained. See [PUBLIC-FORMS.md](PUBLIC-FORMS.md), [curated-forms-results.json](curated-forms-results.json) and the updated [local-results.json](local-results.json). Eleven migrations are now included; the older fresh-database eight-migration result above is historical evidence, not a fresh eleven-migration rehearsal. Hosted setup, live provider calls and email delivery remain unverified. No GitHub push was made.


## Permanent removal and test-data cleanup — 19 November 2026

The owner subsequently approved deleting the synthetic records and fully deleting unwanted forms. This supersedes the earlier archive/history-preservation decision. Removed 23 form source files, reduced the catalog to 12 definitions, deleted 13 unused database definitions, 20 QA form definitions, 6 QA pages, 66 verified synthetic submissions with their 66 linked clients, linked reviews/corrections/verification jobs, dummy drafts and test activity. Login accounts and access/office settings were preserved. Deletion was scoped to verified IDs after a broad local-table clear was rejected by automatic review; no broad truncation was performed.

Production build and TypeScript passed. Six updated curated-form browser/database checks, the read-only answer rendering check, syntax checks and configuration validation passed. Final local state: zero submissions, clients, appointment requests, conveyancing drafts and audit entries, with twelve forms and the existing login accounts retained. Hosted data, actual LiveSign and email were not touched; nothing was pushed to GitHub. Historical SQL migrations remain intact; the twelfth migration deletes removed definitions only if they have no remaining submissions.
