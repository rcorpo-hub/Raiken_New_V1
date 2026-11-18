# Expanded footer — 17 November 2026

final result: passed

The existing footer had three city names, an existing-clients link and very small utility links over a dominant decorative image. The requested change adds the standard useful information to every public page while retaining the established cream, orange, serif and stationery styling.

## Changes

- Logo, brand message, email and the existing public WhatsApp destination.
- Service links to Personal tax, Business accounting and Conveyancing, plus the existing quote calculator.
- Company navigation for Home, Our people, Insights, Contact and Appointments.
- Client resources for the complete forms directory, accounting software, digital signatures and support, with an enquiry action.
- Three office sections with the existing addresses, clickable telephone numbers, Google Maps address searches and links to the matching contact-page anchors.
- Current-year copyright, the real XML sitemap and a back-to-top link.
- Readable type, grouped columns and a quiet stationery background. The footer changes to two-column navigation and stacked offices on phones.

Only `src/components/public/Footer.tsx` and the appended `.footer-expanded` CSS were changed in application source. No API, validation, calculation, form-submission or database source changed. No packages, legal pages, claims, unverified social profiles or new backend functionality were added.

## Verified

- `npm run build` passed: compilation, TypeScript and all 37 generated pages.
- `git diff --check` passed for both edited source files.
- Ten browser checks passed against the production build at localhost:3000, with no browser console/page errors or failed resource responses. See `results.json`.
- Every unique internal footer destination (13) returned HTTP 200; `/sitemap.xml` returned XML.
- All three service links reached their correctly scoped seven-form directories. All three office links reached their respective contact-page anchors. Back to top returned to the beginning of main content. The footer is shared by Home, Forms, Contact and Team.
- Layout and link bounds checked at CSS widths 360, 390, 640, 768, 1024, 1280, 1536 and 2553. No horizontal document or footer-link overflow. The complete homepage service card still fits the laptop opening view.
- Desktop, large-monitor and phone captures inspected. The first clipped phone capture included the existing offscreen fixed skip link because the capture area extended above the viewport. Its actual browser rectangle remained y=-80..-32 with BODY focused; it was not visible in the viewport. Final phone proof uses a whole-page capture at scroll position zero, cropped to the footer. No application workaround was added for this capture artifact.
- Native in-app browser automation was unavailable (helper crash). Used the temporary standalone headless Chromium runner already installed outside project dependencies. External phone/email/WhatsApp/maps destinations were inspected but not activated; no messages or submissions were sent.

## Published content checked

Contact details and the WhatsApp destination match the existing website at https://rcorpo.com/ and the project's existing contact page. Checked the public WordPress pages endpoint, which returned all 35 published pages: none had a privacy, terms, legal or disclaimer title/URL. The direct `/privacy-policy/` and `/terms-and-conditions/` URLs returned HTTP 404, and the public page search for privacy returned an empty list. Site searches found a privacy consent statement and engagement terms inside client forms, but these are not standalone website policies.

Accordingly, no Privacy Policy or Terms link was invented or pointed to a missing page. Those footer links remain pending actual policy pages and approved content. No legal-compliance certification is claimed. Existing backend integration limits remain outside this footer-only update.
