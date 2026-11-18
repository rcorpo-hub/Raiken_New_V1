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
