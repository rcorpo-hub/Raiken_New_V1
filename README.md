# Raikan Corporation website and owner workspace

The redesigned Next.js website and owner dashboard are on the **staging** branch. The main branch is unchanged.

```powershell
git clone --branch staging --single-branch https://github.com/rcorpo-hub/Raiken_New_V1.git
cd Raiken_New_V1
pnpm install --frozen-lockfile
```

Start with the [developer deployment handover](docs/owner-workspace/DEPLOYMENT-HANDOVER.md). It covers the Supabase database, Auth and private storage; environment configuration; separate Next.js application hosting; and the first owner account, which must be provisioned **last**. Do not put passwords or API keys in Git.

- [Submission category filters and Field / Value entries](docs/owner-workspace/SUBMISSION-REVIEW.md)
- [Local setup and test commands](docs/owner-workspace/SETUP.md)
- [Verification evidence and current limits](docs/owner-workspace/VERIFICATION.md)
- [Legacy migration decision and procedure](docs/owner-workspace/LEGACY-MIGRATION.md)
- [Environment template](.env.example)

The application includes permission- and office-scoped staff access, MFA, encrypted submission answers, immutable originals with correction history, content publishing and basic versioned forms. The local production build and 18 browser/database checks passed on 17 November 2026. A separate empty local database verified the baseline eight migrations, with access policies on all 45 application tables. The ninth migration adds scoped historic form metadata for submission review. Hosted acceptance has not been performed.

This is ready for staging setup, with remaining launch work described in the handover: upload verification/scanning, advanced form behavior, actual calendar reservations, submission email delivery, approved retention/legal wording and any legacy-record import. Real Supabase connection details and the owner's email are intentionally absent.
