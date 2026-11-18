# Legacy data migration decision and procedure

Status: awaiting the client's decision about new records only versus new and old records. No live WordPress data, files or credentials have been accessed or imported for this work.

## Questions to settle

- Which form submissions, attachments, clients, appointment history and support records must be retained, for which dates and offices?
- Which systems are authoritative (WordPress forms, Bookly, mailboxes or accounting software)? What are their export formats and stable source identifiers?
- Who approves access, corrections, retention, restricted client-named forms and eventual cutover? Which records require a legal hold?

Keep all current form entries until this is answered. A missing main-menu link is not evidence that its historic data should be removed.

## Protected rehearsal

1. Obtain a fresh encrypted database export and attachment manifest through an approved private channel. Exclude credentials. Restrict raw files to ignored `docs/migration/raw` or `docs/migration/dumps`, with controlled access and retention; never commit them.
2. Inventory counts by source form, office, date and status. Preserve source IDs, original dates/time zones, field labels, answered versions and relationships. Record missing or inaccessible files explicitly.
3. Build an importer against a separate staging project after inspecting the real source schema. `legacy_import_batches` and `legacy_mappings` provide a foundation for source-to-target provenance; they are not a completed importer.
4. Use an import batch and stable `(source_system, source_type, source_id)` mappings. Encrypt imported answers with the target key, preserve original values and attach any corrections as new history. Keep unknown office assignments restricted to the owner. Shared email addresses must not cause automatic client merges.
5. Keep sending disabled for historic records. Do not replay old appointment reminders, form receipts or invitations. Quarantine imported files until independently verified; filename and extension do not establish MIME type or cleanliness.
6. Reconcile counts and sampled full records: forms, branches, timestamps, totals, IDs, attachments/checksums, contacts and status. Compare before/after totals per source group; report duplicates, unmapped fields and missing files. A repeat run must not duplicate records.
7. Obtain client approval of the reconciled staging result and documented exceptions. Back up source and target, choose a cutover window, account for records entered during export, and plan rollback before touching production.

## Cutover and rollback

The approved source remains intact until reconciliation and an agreed retention period are complete. Keep the import mapping and batch audit. Roll back only the affected import batch with a reviewed dependency plan; do not reset a populated database. Deployment/DNS changes, source deletion and legacy mail replay are not part of this local implementation.
