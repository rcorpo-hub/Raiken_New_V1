begin;
create policy submitted_version_metadata on public.form_versions for select to authenticated
using(exists(select 1 from public.submissions s where s.form_version_id=form_versions.id and public.admin_can('submissions.read',s.branch_id)));
commit;
