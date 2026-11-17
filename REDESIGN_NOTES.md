# Raikan paper-desk redesign

Implemented locally in the Desktop clone on `codex/paper-desk-redesign`.

- Visual source: the user's selected cream, vermilion and black paper-folder concept; retained in `.diagnostics/design-reference.png`.
- New homepage with accessible, interactive Personal tax / Business accounting / Conveyancing tabs.
- New shared header, mobile menu, footer, typography and visual theme.
- Rebuilt contact, team and searchable client-form directory pages. All 24 original form-directory destinations retained.
- Existing form and quote-calculator components receive the shared theme; their field definitions, calculation and submission logic are retained.
- Original legacy welcome popup and floating social overlay are no longer mounted in the new layout. Contact options remain in contact pages and office links; accounting software, support, appointments and insights are available in footer links.
- Existing Next.js runtime and routes retained. No new backend, authentication provider, deployment, or hosting service added.

## Backend impact

No backend changes required by this design. Files in `src/app/api` and `src/lib` were verified unchanged by SHA-256 when applying the redesign. Existing Supabase migrations and configuration are untouched.

Pre-existing setup dependency: Supabase project credentials are not included. End-to-end form persistence, newsletter storage and database notifications cannot be verified locally without that configuration. The existing privileged-client implementation warns about offline mode but still constructs a client with empty credentials; this is an existing backend issue, not a change introduced by this frontend. It was deliberately left for the owner to review.

## Verification

- Production build passed and generated 37 pages.
- TypeScript checks passed.
- Browser: all three service tabs, arrow/Home keyboard controls, mobile menu and Escape dismissal.
- Browser: contact native required-field validation; no valid submission or external record created.
- Browser: directory search finds Rental Property Summary; unmatched searches show an empty state.
- Browser: calculator legal fee 990 → 1100 changes buyer total 1551 → 1661, then resets to 990.
- Browser: mobile homepage, contact and team page checked for horizontal overflow.
- See `design-qa.md` for reference comparison evidence and remaining cosmetic differences.

## Assets

Built-in Image Gen produced individual project-local raster assets under `public/images/redesign`: folder panel, transparent desk-edge cutout, footer stationery, black wordmark, handwritten annotation and brush underline. Source prompts and provenance are recorded in `docs/design/asset-prompts.md`. Transparent padding was normalized for display. UI remains live HTML; the page is not a screenshot.
