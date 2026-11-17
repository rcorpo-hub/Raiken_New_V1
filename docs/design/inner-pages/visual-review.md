# Inner-page visual polish — 16 November 2026

final result: passed

## Target and scope

User request: make the existing inner pages a little more appealing using the landing page's established paper-desk direction. This is an extension of that selected style, not a pixel clone of a new mock. Source visual language is captured in `docs/design/inner-pages/evidence/homepage-style-reference.jpg`; existing page baselines are the `*-before.jpg` captures. Scope is presentation: one shared illustrated introduction, FormsDirectory markup, contact/team introductions and CSS for existing form/utility pages. Homepage source, form definitions, field markup, submission handlers, calculations, APIs and database code were not edited.

## Evidence

- Full-view before/after boards: `docs/design/inner-pages/evidence/comparison-forms-contact.jpg` and `comparison-team-client.jpg`.
- Final desktop views: `forms-final.jpg`, `contact-final.jpg`, `team-final.jpg`, `client-form-final.jpg`.
- Responsive examples: `forms-phone.jpg`, `contact-phone.jpg`, `team-phone.jpg`, `client-form-phone.jpg`, `contact-tablet-final.jpg`, `forms-large.jpg`.
- Utility examples: `appointment-desktop.jpg`, `appointment-phone-final.jpg`, `support-desktop.jpg`, `blog-desktop.jpg`, `quote-desktop.jpg`.
- User preview board: `inner-pages-preview.jpg`.
- Measured checks: `checks.json`.
- CSS viewports: desktop 1536 × 900, tablet 768 × 1024, phone 390 × 844, large monitor 2553 × 1353. Desktop exports are 1521 × 891 pixels, phone 375 × 812, final tablet 753 × 1004, large monitor 2538 × 1345. Browser export/platform scaling and scrollbar exclusion mean exported pixels differ from CSS dimensions. Boards normalize both sides proportionally to a common 900px width before comparison. No exact pixel-diff or actual-device certification is claimed.
- Before/after boards were opened together. Full-size individual captures and the tablet contact view were also inspected to judge controls, type wrapping, field edges and image quality at readable size.

## Review and resolved findings

1. **[P2, resolved] Orphaned legacy form title.** First pass constrained headings to 22ch, leaving a short final word on another line. Removed that arbitrary cap while retaining a bounded form canvas. `client-form-final.jpg` shows clean desktop title wrapping.
2. **[P2, resolved] Tablet contact input columns were cramped.** A two-column contact form inside the tablet sidebar layout truncated the field prompts. Below 900px the existing contact field grids now stack. `contact-tablet-final.jpg` and measured grid width confirm a single 323.67px track at a 768px viewport.
3. **[P2, resolved] Selected-border selector also matched focus utility names.** An initial substring selector tinted inactive fields orange. Narrowed it to an exact class token so only actually selected controls receive that border. Post-fix measured inactive field border is rgb(189,180,166); paper top edge and selected Phone Call radio border are rgb(232,66,29). Final client-form evidence contains neutral fields.
4. **[P3, resolved] Old blue logo used as a portrait on the team page.** Replaced that existing image with the current orange/ink logo and accurate Raikan Corporation alt text. No fabricated staff portrait introduced.
5. **[P3, resolved] Legacy important border colors suppressed paper accents.** Narrowed the final paper-edge override so it wins without coloring ordinary field borders. Computed border and screenshot verify the intended orange edge.

No actionable P0/P1/P2 findings remain in this scoped update.

## Required fidelity surfaces

- **Typography:** Existing DM Serif Display and DM Sans retained. Inner titles now use a compact responsive hierarchy; body text remains readable and line lengths are bounded. No clipped labels or navigation in inspected desktop, tablet or phone views. Long staff names wrap naturally.
- **Spacing/layout:** Illustrated introductions echo the homepage without repeating its full hero. Directory services read as tabs and each category as one paper section; search and result feedback are grouped clearly. Forms have a comfortable maximum width, quiet paper surfaces and adequate input heights. Small screens stack and scroll. Header and homepage layout remain intact.
- **Colors:** Existing cream, ink, vermilion and lilac tokens retained. Error/success semantics and focus outlines remain; selected controls use the orange accent and inactive fields remain neutral. No claim of a full WCAG contrast audit of existing content.
- **Imagery:** Reused real generated assets already present in the project: paper-stack-v2.png, pen-cup-v2.png, eucalyptus-sprig-v2.png, underline-brush.png, folder-panel.png and logo-warm.png. No new images, placeholder portraits, drawn SVG art or CSS illustration stand-ins. Decorative images use empty alt text and reserved sizes; the brand image has descriptive alt text. Warmth and tactile paper match the landing-page direction. Slight raster softness is a non-blocking P3 at large sizes.
- **Copy/content:** Existing headings, office details, team names/roles and service descriptions retained. Added navigation labels and visible search-result feedback only. Company and Trust remain business subgroups. All 24 form destinations remain available. Existing legacy security/privacy wording and historical article content were not newly certified or rewritten by this visual task.

## Executed verification

- `npm run build` passed: Next.js compilation, TypeScript check and 37 generated pages. Subsequent CSS-only refinements were verified in browser afterward.
- Directory: 7 Personal, 7 Business, 7 Conveyancing and 24 All forms. Business subgroups contain Company 2 and Trust 5.
- Personal search for rental returns one result; an unmatched query shows the scoped empty state. Switching to Business resets the query and shows seven business forms. All service navigation links work.
- Appointment: Phone Call radio selection reflected in the DOM and orange selected border. No appointment submitted.
- Calculator: changing the existing legal fee from 990 to 1000 updates the displayed buyer total from 1551 to 1561; value restored. No quote submitted. Rates and calculation code unchanged.
- All four main page styles inspected at desktop, tablet and phone widths with no horizontal document overflow. Forms directory also checked at 2553px width. Support, blog and calculator desktop renderings inspected.
- Browser console error query returned no errors. Viewport override reset and refreshed personal forms directory left open.
- React review: shared intro is a pure presentation component; existing client state and server-side form filtering remain where they were. No effects, data fetches, dependencies or new backend boundaries added. Search label, live result status, semantic service links and decorative image alt treatment retained.

## Limits / follow-up polish

- No real submissions or Supabase persistence tested; credentials remain absent. This task changed no backend behavior.
- Representative Chromium viewports were inspected; this is not exhaustive browser/device certification.
- Reused assets can have subtle alpha/shadow differences and native font antialiasing differs from generated references. These are P3, not blockers.
- No deployment, push or commit performed.

## Checklist

- [x] Extend the established homepage style with minor inner-page treatment.
- [x] Preserve fields, category grouping, destinations and backend code.
- [x] Inspect combined before/after and readable responsive evidence.
- [x] Resolve identified P2 issues and capture post-fix states.
- [x] Verify search, navigation, selection and calculator behavior.
- [x] Pass production build, save evidence and restore browser sizing.

---
