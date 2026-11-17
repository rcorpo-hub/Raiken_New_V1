# Extra forms review and directory decisions

Reviewed 16 November 2026 using the current form components and the repository's `docs/planning/FEATURE_INVENTORY.md`. The review covers form purpose and directory placement, not submission correctness or field parity with production.

## Decisions

| Entry | Evidence from its current fields | Directory decision |
| --- | --- | --- |
| Tax Declaration Form (3057) | TFN, employment/payment basis, tax-free-threshold selection, loan-debt questions, identity and contact details | Retain under Personal tax. Replace the inaccurate generic income/deductions description with the form's actual purpose. |
| Shiva Family Trust (3202) | Same field names and labels as the Tax Declaration page; own named route and submission slug | Retain within Business accounting → Trust. Describe as a TFN/employment tax declaration for this named trust, not an asset/distribution schedule. |
| Shree Ashapuri Unit Trust (3211) | Same TFN/employment field set; own route and submission slug | Retain within Trust and identify the named audience. Replace the inaccurate subscriber-register/asset-allocation description. |
| Paarthav Family Trust (3957) | Same TFN/employment field set; own route and submission slug | Retain within Trust and identify the named audience. Replace the inaccurate member-declaration/record-administration description. |
| Residential Property (724) | Vendor and property particulars, title references, agent contacts, payment/receipt fields and property-specific questions | Retain under Conveyancing: distinct from the current purchaser/vendor intake pages. |
| Form For Vendor (Sales) (727) | Settlement/forwarding address, bank account/BSB, GST/ABN and contact instructions | Retain under Conveyancing: settlement instructions are not equivalent to the newer vendor intake's contact/property/mortgage fields. |
| Buyer Form (732) | Buying/ownership type, owner count and repeated purchaser names/dates of birth | Retain under Conveyancing: different field structure from the current purchaser intake. |

These paths are also recorded as published placements in the repository's historical inventory. That supports retaining them, but does not by itself prove current live usage or successful submission.

## Category changes

- Move New Client Questionnaire (2549) from Accounting/Business to Registration/Personal tax, following the live site's Individual grouping and its individual-applicant fields.
- Business accounting contains Company (2 forms) and Trust (5 forms) subgroups.
- Keep all 24 IDs and destination URLs unchanged: Personal 7, Business 7, Conveyancing 7, General 3.

## Remaining clarification

The three named-trust pages currently have the same fields as the general Tax Declaration page but submit to different slugs. Their names alone do not establish why separate payer-specific versions exist. Confirm their intended audience/routing before merging or retiring any of them. No form was removed or merged in this change.

No form fields, submission payloads, APIs, Supabase clients or database migrations are changed by this directory cleanup.
