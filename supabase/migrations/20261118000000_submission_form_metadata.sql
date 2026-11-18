begin;
-- Reviewers may identify the forms behind submissions they can already read,
-- including retired forms. Existing column grants still exclude draft schemas.
create policy submitted_form_metadata on public.forms for select to authenticated
using(exists(select 1 from public.submissions s where s.form_id=forms.id and public.admin_can('submissions.read',s.branch_id)));
commit;
