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

# Centered navigation and original logo — 16 November 2026

final result: passed

User-directed change: center Services / Our people / Contact on the viewport and use the original logo from https://rcorpo.com/. This explicitly supersedes the generated black wordmark and left-aligned navigation in the prior selected mock.

Source logo: https://rcorpo.com/wp-content/uploads/2020/03/logo.png, 354 × 159 RGBA. Fresh download SHA-256 `40f972c2b4222ce9719d1c739f49125acd78fd64f74b37568d70708aec09069b` matches the existing `public/images/logo.png` byte-for-byte. Header and footer now reference this original file. No logo recoloring, redrawing or image generation. The live footer's white-text alternative is unsuitable on the cream background, so the original dark-text variant is used for both placements.

## Evidence and checks

- Combined before/after: `docs/design/header-update/header-comparison.jpg`; same 1536 × 784 CSS viewport, header crop only. Export screenshot is 1521 × 776 and normalized to 1536px width for comparison. No fake 1:1 pixel-diff claim.
- Full context: `header-desktop.jpg`, `header-large.jpg`, `header-tablet.jpg`, `header-phone.jpg` in that directory.
- Header measurements: `header-checks.json`. Main navigation center differs from the content viewport center by at most 0.17 CSS px at 641, 768, 1200, 1536 and 2553px widths. No logo/nav/action overlap or horizontal overflow. On narrow headers the duplicate enquiry button hides; Contact and Existing clients remain available. Phones retain the existing menu.
- At 1536 × 784 the complete service card ends at y=736.97; at 2553 × 1353 it ends at y=1275.19, retaining the viewport fit.
- Phone menu opens/closes. Our people navigation reaches `/team`; its shared header is also centered. Home logo returns to `/`. Header/footer image sources verified as `/images/logo.png`, with successful image load. No browser console errors.
- `npm run build` passed, including TypeScript compilation and 37 generated pages.
- React review: existing state and hooks untouched; semantic navigation, accessible logo text, menu controls, current-page state and escape-to-close behavior retained. Correct intrinsic image aspect ratio used, with responsive sizes. No new dependency or backend change.

## Fidelity review

- Typography: current site fonts, text sizes and labels retained; only navigation alignment changes.
- Spacing/layout: equal side grid tracks keep the navigation centered independent of different logo/action widths. Logo dimensions preserve its native aspect ratio. Header height accounts for the taller original logo without breaking card fit.
- Colors: original black/cyan brand colors preserved; surrounding cream/orange palette unchanged.
- Images: original source logo verified by hash and inspected directly. Footer uses the same legible dark-text variant. Original source resolution is 354px wide, so it may soften on very high-density screens; no invented high-resolution artwork substituted.
- Copy/content: exactly the requested three labels and existing destinations retained.

No actionable P0/P1/P2 findings. Previous responsive QA follows below; its mock wordmark is intentionally superseded by this explicit user request. Browser viewport override reset and homepage left open. No deployment or push.

---

# Option 2 responsive homepage — 16 November 2026

final result: passed

## Visual targets and evidence

- Selected truth: second displayed ImageGen result, copied to `docs/design/option-2/selected-reference.png` (1755 × 896).
- Latest approved laptop reference: `C:/Users/DHRUVIL/AppData/Local/Temp/codex-clipboard-fdafcdd4-92d5-4585-a9e9-728fdf7fabf0.png` (1535 × 857 including browser chrome). Browser chrome cropped at y=80 for comparison only.
- Implementation: running `http://localhost:3000/`, Personal tax selected, default scroll position.
- Laptop: 1536 × 784 CSS viewport; exported screenshot 1521 × 776 pixels, `docs/design/option-2/evidence/laptop-responsive-final.jpg`.
- Large monitor: 2553 × 1353 CSS viewport; screenshot 2538 × 1345, `docs/design/option-2/evidence/large-responsive-final.jpg`.
- Browser screenshot export uses platform scaling and excludes scrollbar pixels. Comparison copies normalize both screenshots to a common 1536px width with proportional height; exact layout measurements use CSS bounding rectangles. No claim of a 1:1 pixel-diff test.
- Combined full-view comparison: `docs/design/option-2/evidence/responsive-comparison-final.jpg` contains the approved laptop reference, current laptop and current large monitor together.
- Focused type/spacing comparison against selected mock: `docs/design/option-2/evidence/type-and-spacing-final.jpg`.
- Side-by-side delivery proof: `docs/design/option-2/evidence/responsive-proof.jpg`.
- Phone full-page evidence: `docs/design/option-2/evidence/phone-responsive-final.jpg`; tablet, compact desktop, Full HD, ultrawide and 4K captures retained alongside it.

## Findings and comparison history

1. **[P1, resolved] Large monitors outgrew fixed visual limits.** The user screenshot and browser reproduction showed a card fixed at 820px high, hero type capped at 104px and body type capped at 24px, inside a viewport-height canvas that kept expanding. This changed the laptop proportions and left a large empty lower region. Replaced independent upper caps with one shared width/height scale based on the approved 1536 × 784 composition. Card height now uses available viewport height. At 2553 × 1353, measured hero type is 119.69px, body 34.91px and card height 975.98px; card bottom is 1275.19px, within the 1353px viewport. Personal heading remains two lines. Post-fix: `large-responsive-final.jpg` and combined comparison.
2. **[P2, resolved] Phone artwork was cropped into a separate background strip.** Initial full-page phone capture showed an obvious join between the flat orange copy region and embedded photograph. Separated the illustration from the orange texture using the actual generated cutout. A subsequent capture exposed repeated texture on tall cards; changed phone texture sizing to `auto 180%` and disabled repetition. Post-fix `phone-responsive-final.jpg` shows one continuous texture and the complete paper stack.
3. **[P2, resolved] Services anchor could move the fitted desktop composition off-screen.** Desktop service scroll margin now includes header height and opening spacing. Browser click on Services ends at scrollY=0, with the full card still visible. Stacked smaller layouts retain normal anchor navigation.

No actionable P0/P1/P2 findings remain in this scoped visual implementation.

## Required fidelity surfaces

- **Fonts / typography:** Existing DM Serif Display and DM Sans retained. Shared scale preserves heading, body and button relationships on larger screens. Minimum readable sizes remain for compact desktop and phones. Body line lengths and the service heading width are bounded; no clipped text in tested states. Native font rendering differs slightly from the generated mock. The user's approved laptop image governs responsive refinements.
- **Spacing / layout:** Side-by-side desktop introduction/enquiry and service folder reproduce the selected hierarchy. Header, gaps, padding, controls and decorations scale together. Portrait and narrower screens stack. Desktop card and main headline fit within the tested landscape viewports. Mobile content uses normal document scrolling.
- **Colors / tokens:** Existing cream, vermilion, ink and lilac retained; no invented palette or gradient. Selected tabs, focus rings and cream buttons remain distinct. This is not a formal WCAG contrast certification of the pre-existing brand palette.
- **Image quality:** Existing generated wordmark, brush underline and folder texture reused. New real raster cutouts for pen cup, eucalyptus and paper stack match the selected mock. No handcrafted CSS/SVG illustrations. Paper subject, proportions and alpha edges verified over orange; decorative shadow softness differs slightly from the mock, P3. Phone texture does not repeat.
- **Copy / content:** Main headline, service descriptions and destinations preserved. Enquiry paragraph uses natural wrapping. No form fields, category data, APIs, Supabase behavior or submission logic changed.

## Executed verification

- Responsive browser checks at CSS viewports: 360 × 800, 390 × 844, 768 × 1024, 970 × 669, 1100 × 650, 1280 × 720, 1536 × 784, 1920 × 1080, 2553 × 1353, 3440 × 1440 and 3840 × 2160.
- 768 × 392 viewport also checked for a reflow equivalent to a 1536 × 784 viewport at 200% zoom; this was viewport emulation, not browser zoom or an accessibility certification.
- No horizontal document overflow in measured states. Full desktop service card visible. Longer Business accounting CTA verified on 1280px, 1100px and 360px widths; on the narrow phone it wraps inside its button without clipping.
- Keyboard ArrowRight, End and Home select the correct tabs with corresponding `aria-selected` state. All three Explore destinations verified unchanged: personal-tax, business-accounting, conveyancing.
- Actual Explore personal tax navigation opens the personal-only directory with 7 forms.
- Phone menu opens and closes with correct expanded state. Desktop Services anchor verified after adjustment.
- Browser console error query returned no errors.
- `npm run build` passed: Next.js 16.4.4, TypeScript compilation and 37 generated pages. Final CSS-only anchor and non-repeating texture refinements verified in browser afterward.
- React review: homepage remains a server component; only the existing service tabs own client state; semantic links and tabs, decorative empty alt text, focus styles and reduced-motion behavior retained. No added effects, data fetches or client dependencies.
- Browser viewport override reset and local homepage left open.

## Remaining limits / P3 polish

- Source art and native font antialiasing are not pixel-identical to ImageGen. Decorative cutout shadows are slightly different; these do not affect readability or operation.
- Tablet service labels can wrap, with height following content. No clipping or blocked controls.
- Testing used the connected Chromium browser, not every browser/monitor/OS scaling combination. Real backend submissions remain unverified because Supabase credentials are absent; no backend changes were required for this layout.
- No deployment, commit or push performed.

## Implementation checklist

- [x] Resolve displayed option 2 and preserve its visual direction.
- [x] Generate and place measured raster assets.
- [x] Scale desktop composition with both viewport dimensions.
- [x] Preserve smaller-screen reading order and scroll behavior.
- [x] Verify tab, menu, anchor and category-link interactions.
- [x] Compare combined full views and focused regions; resolve P1/P2 findings.
- [x] Run production build; save evidence and restore browser viewport.


## Subsequent user request: warm logo palette

final result: passed

The user requested recoloring the original logo to suit the website. A built-in ImageGen edit produced the orange/ink transparent variant now used by header and footer. Original blue logo retained. Source, full prompt and asset path are in `docs/design/logo-recolor/logo-edit-notes.md`. Inspected browser-rendered header/footer on cream, verified both image loads and retained centered navigation; no CSS or backend change. TypeScript check passed and browser error log was empty. Screenshot evidence: `docs/design/logo-recolor/header-logo-proof.jpg` and `full-page-proof.jpg`. No deployment or push.
