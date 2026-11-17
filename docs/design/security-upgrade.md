# Next.js security patch verification — 17 November 2026

Upgraded the existing `codex/raikan-website-redesign` branch from Next.js 16.4.4 to 16.4.6, the same-major stable target selected by Next.js's security-upgrade planner. Main was not changed. The pnpm lockfile updates only Next.js, @next/env and the platform SWC packages. Existing React and application dependencies remain at their previous versions. Enabled `experimental.agentUpgrade: 'security'` for subsequent security-update checks.

## Executed checks

- `pnpm add next@16.4.6 --save-exact`: completed; installed version confirmed by `pnpm exec next --version`. The package manager retained the project's caret range (`^16.4.6`); the lockfile resolves exactly 16.4.6.
- `npm run build`: exit 0, Next.js compilation and TypeScript passed, all 37 pages generated. The previous SecurityFatalError did not recur.
- `npm run typecheck`: exit 0.
- `git diff --check`: passed.
- Production server: `pnpm exec next start --hostname 127.0.0.1 --port 3000` started successfully.
- Headless Chromium against that production server: 18 checks passed, recorded in `security-upgrade/results.json`. No page errors, console errors, failed responses, failed resources or form submissions.
- Homepage tabs respond to clicks and Home/End keys. The complete service panel fits within laptop (1536×900) and large-monitor (2553×1353) viewports. Phone (390×844) homepage and inner pages, plus tablet (768×1024) contact page, have no horizontal document overflow.
- Explore personal tax reaches the scoped directory. Personal, Business and Conveyancing each retain 7 forms; all forms retains 24; Company has 2 and Trust has 5. Search, empty state and resetting the query when changing service work.
- All 24 directory destinations plus the supporting public routes recorded in results.json return HTTP 200. Existing /home and /engage redirects retain HTTP 308 and their destinations.
- Contact controlled input and native required-field validation work without sending a submission. Calculator legal fee 990→1000 changes the computed buyer total 1551→1561, then resets. Phone Call appointment selection works. Mobile navigation opens and Escape closes it.
- Laptop, large-monitor and phone screenshots inspected. No application styling, fields, calculations, API handlers or database source changed in this patch.

## Remaining issue and verification limits

`pnpm audit --prod --json` reports **one high-severity advisory in the existing Zod 3.25.76 dependency**, and no Next.js advisory. The report is retained in `security-upgrade/audit.json`. Advisory GHSA-mrhx-c7xc-m3w5 reports excessive memory use while validating oversized collections, with a patched range >=4.6.6. This is a separate, pre-existing dependency issue, not a regression caused by the Next.js patch. Resolving it entails a Zod major-version migration and review of backend validation; it was flagged to the owner and left outside this Next.js-only update. This report does not certify whether an exploitable path exists in this application.

Supabase credentials are still absent. Valid submissions, persistence, email delivery and database integration were not tested. No valid forms were submitted. The standard in-app browser helper failed to initialize (timeout/native helper crash), so these checks used a temporary standalone Playwright runner and the installed headless Chromium instead. The runner is tooling outside the application dependencies. No real-device or cross-browser certification is claimed.

## Sources

- Official Next.js 16.4.6 release: https://github.com/vercel/next.js/releases/tag/v16.4.6
- Zod advisory: https://github.com/advisories/GHSA-mrhx-c7xc-m3w5

No pull request or merge to main was requested or performed.
