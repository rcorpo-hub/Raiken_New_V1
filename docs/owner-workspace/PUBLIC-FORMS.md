# Approved public forms

Updated 19 November 2026 from the owner's four menu screenshots, with Appointment booking explicitly retained. There are **12 forms** before the owner publishes any additional custom forms.

| Service | Form | Public path |
| --- | --- | --- |
| Personal tax | New Individual Client Form | /new-individual-client-form |
| Personal tax | New Individual Tax File Number Application | /new-individual-tax-file-number-application |
| Personal tax | New Individual ABN Application | /new-individual-abn-application |
| Personal tax | New Client Questionnaire Form | /new-client-questionnaire-form |
| Personal tax | Rideshare / Taxi GST | /rideshare-taxi-gst |
| Personal tax | Rental Property Summary | /rental-property-summary |
| Business accounting — Company | New Company Registration | /new-company-registration |
| Business accounting — Company | New Company Client Form | /new-company-client-form |
| Business accounting — Trust | New Trust Registration | /new-trust-registration |
| Business accounting — Trust | New Trust Client Form | /new-trust-client-form |
| Conveyancing | New Client Conveyancing Form | /nc |
| Appointments | Appointment Booking Form | /appointment-booking-form |

The /appointment alias still opens Appointment booking. The three homepage service links filter to 6 Personal, 4 Business and 1 Conveyancing form. Appointment booking is also available from the full directory and site navigation.

All other form components, page routes, validation contracts and catalog definitions have been deleted, including the old purchaser/vendor forms. Contact remains an office-information page. Newsletter signup and the enquiry components are removed. A small URL tombstone list prevents removed form URLs from being reused accidentally; it contains no questions or rendering code. Historical SQL migrations remain in sequence for reproducible database setup.

The owner explicitly approved deleting the existing local test data. Verified synthetic submissions, linked clients/reviews/jobs, QA forms/pages, dummy drafts and test activity entries were deleted. Login accounts, permissions, office settings, actual website content and the twelve approved forms remain. No hosted database was changed.

Apply all twelve migrations through `20261119000001_delete_unused_forms.sql`. This final migration deletes removed form definitions only when they have no submissions; it refuses to erase any referenced submissions automatically. Local test-data cleanup is not a deployment migration and will not clear a hosted database.

Run `node tests/curated-forms.cjs` for the approved directory and removed URL checks. These checks create no final submissions or LiveSign requests. Owner regression tests intentionally create synthetic records and should run only in a disposable test database. No GitHub push was made.
