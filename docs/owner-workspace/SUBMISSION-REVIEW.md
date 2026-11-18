# Submission filters and readable entries

Added 18 November 2026.

## Owner workflow

Open **Submissions**, choose a service category and optionally a specific form, then apply filters. The category choices match the homepage: Personal tax, Business accounting and Conveyancing, plus General enquiries. Each row also shows its category. Status, office and reference search combine with these filters. Form choices narrow to the selected service, and applying filters starts at page one. Pagination keeps the last applied selection until Apply filters is used again.

Filtering is performed by the server before the 25-row page is selected, so totals and subsequent pages include every permitted matching submission. It uses the same legacy form grouping as the public directory, while newly managed forms use their selected category. Archived forms with retained submissions remain identifiable to permitted reviewers.

Open a reference to see the submitted form title, reference, date and version, followed by a **Field / Value** table. Questions follow the submitted version's labels and order, including optional unanswered questions. Choices show their labels, confirmations show Yes/No, zero values remain visible and blanks show Not provided. Managed forms also show the contact inputs and office. Repeated/nested values have readable lists instead of raw JSON. Additional stored fields remain visible when an older partial definition lacks their metadata. Original answers and correction history are retained.

## Deployment

Apply `supabase/migrations/20261118000000_submission_form_metadata.sql` along with the existing migrations, then rebuild the Next.js app. The release now includes nine migrations. This policy permits authenticated reviewers to identify an archived form only when they can already read a submission for that form in their permitted office. Existing column grants continue to exclude draft schemas; anonymous access is unchanged.

## Verification

```powershell
node tests/submission-answers.cjs
# Local synthetic database only; run the app on localhost:3000 first:
node tests/submission-review.cjs
```

The rendering checks cover all 24 registered schemas plus blanks, zero, false, choice labels, additional keys, managed contact fields, repeated values and escaped stored text. The browser/database checks exercise combined filters, 28 matching records across pages, restricted-office and archived-form access, original labels after a form update, existing purchaser labels and four screen sizes. Results and screenshots are saved in ignored `.diagnostics/submission-review-evidence/`. Only newly created disposable synthetic rows are cleaned up; three synthetic examples remain for local review. No attachment scanner, mail sender or hosted account is configured by this change.

Executed locally on 18 November 2026: production build/TypeScript passed; rendering checks covered all 24 registered schemas; all 8 targeted browser/database checks passed; the existing 18-check owner-workspace regression suite passed. The targeted result is recorded in `submission-review-results.json`. Hosted deployment and hosted acceptance remain pending.
