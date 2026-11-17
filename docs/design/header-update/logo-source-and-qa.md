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
