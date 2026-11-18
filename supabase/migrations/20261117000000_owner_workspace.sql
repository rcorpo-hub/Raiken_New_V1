-- Owner workspace. Apply after the original foundation migration.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

alter table public.profiles add column if not exists email text;
alter table public.submissions add column if not exists revision integer not null default 1;
alter table public.customers add column if not exists revision integer not null default 1;
alter table public.content_items add column if not exists revision integer not null default 0;
alter table public.forms add column if not exists revision integer not null default 0;
alter table public.forms add column if not exists draft_schema jsonb;
alter table public.content_items add column if not exists draft_blocks jsonb;
alter table public.content_items add column if not exists draft_seo jsonb;
alter table public.appointment_requests add column if not exists updated_at timestamptz not null default now();
alter table public.appointment_requests add column if not exists owner_note text not null default '';
alter table public.file_objects alter column scan_status set default 'pending';

create table if not exists public.user_permissions (
  user_id uuid references public.profiles(id) on delete cascade,
  permission_code text references public.permissions(code) on delete cascade,
  primary key(user_id, permission_code)
);
create table if not exists public.submission_corrections (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete restrict,
  revision integer not null,
  answers_ciphertext bytea not null,
  encryption_meta jsonb not null,
  reason text not null check(length(reason) between 5 and 2000),
  actor_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(submission_id,revision)
);
create table if not exists public.legacy_import_batches (
  id uuid primary key default gen_random_uuid(), source_name text not null,
  status text not null default 'awaiting_approval' check(status in ('awaiting_approval','dry_run','approved','importing','completed','failed')),
  manifest_hash text, summary jsonb not null default '{}', approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table if not exists public.legacy_mappings (
  source_system text not null, source_table text not null, source_id text not null,
  entity_type text not null, entity_id uuid not null,
  batch_id uuid not null references public.legacy_import_batches(id),
  source_hash text not null, created_at timestamptz not null default now(),
  primary key(source_system,source_table,source_id)
);

insert into public.roles(id,name,is_sensitive_admin) values
 ('owner','Owner',true),('content_editor','Website editor',false),('forms_editor','Form editor',false)
on conflict(id) do nothing;
insert into public.permissions(code,description) values
 ('dashboard.read','View the workspace overview'),('submissions.review','Update submission review status'),
 ('submissions.correct','Record corrections without replacing original answers'),('customers.read','View customer records'),
 ('customers.manage','Manage customer contact records'),('bookings.read','Read appointment requests'),
 ('documents.read','View document metadata'),('documents.download','Download verified clean documents'),
 ('content.edit','Save website content drafts'),('forms.edit','Save form drafts'),('users.manage','Manage staff access'),
 ('audit.read','Read the audit history'),('settings.manage','Manage approved website settings'),
 ('reports.read','View scoped business reports'),('migrations.manage','Review legacy migration readiness')
on conflict(code) do nothing;
insert into public.role_permissions(role_id,permission_code) select 'owner',code from public.permissions on conflict do nothing;
insert into public.role_permissions(role_id,permission_code) values
 ('content_editor','dashboard.read'),('content_editor','content.edit'),
 ('forms_editor','dashboard.read'),('forms_editor','forms.edit') on conflict do nothing;

-- Never trust user-editable Auth metadata to grant access.
create or replace function public.current_admin_access() returns jsonb
language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('id',p.id,'name',p.display_name,'email',p.email,
 'owner',exists(select 1 from public.user_roles r where r.user_id=p.id and r.role_id='owner'),
 'permissions',coalesce((select jsonb_agg(code) from (
   select rp.permission_code code from public.user_roles ur join public.role_permissions rp on rp.role_id=ur.role_id where ur.user_id=p.id
   union select permission_code from public.user_permissions where user_id=p.id
 ) x),'[]'::jsonb),
 'branches',coalesce((select jsonb_agg(branch_id) from public.user_branch_access where user_id=p.id),'[]'::jsonb))
 from public.profiles p where p.id=auth.uid() and p.status='active'
 and (exists(select 1 from public.user_roles where user_id=p.id) or exists(select 1 from public.user_permissions where user_id=p.id));
$$;
create or replace function public.admin_can(capability text, scope_branch uuid default null) returns boolean
language sql stable security definer set search_path = '' as $$
 select coalesce(auth.jwt()->>'aal'='aal2',false) and exists(
 select 1 from public.profiles p where p.id=auth.uid() and p.status='active'
 and (exists(select 1 from public.user_roles ur join public.role_permissions rp on rp.role_id=ur.role_id where ur.user_id=p.id and rp.permission_code=capability)
 or exists(select 1 from public.user_permissions up where up.user_id=p.id and up.permission_code=capability))
 and (exists(select 1 from public.user_roles where user_id=p.id and role_id='owner')
 or (scope_branch is null and capability not in ('submissions.read','submissions.review','submissions.correct','submissions.export','customers.read','customers.manage','bookings.read','bookings.manage','documents.read','documents.download','audit.read'))
 or (scope_branch is not null and exists(select 1 from public.user_branch_access where user_id=p.id and branch_id=scope_branch))));
$$;
revoke all on function public.current_admin_access() from public,anon;
revoke all on function public.admin_can(text,uuid) from public,anon;
grant execute on function public.current_admin_access(),public.admin_can(text,uuid) to authenticated;

create or replace function private.new_auth_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name,email) values(new.id,coalesce(new.raw_user_meta_data->>'display_name','Account'),new.email)
 on conflict(id) do update set email=excluded.email;
 return new;
end $$;
drop trigger if exists workspace_profile on auth.users;
create trigger workspace_profile after insert on auth.users for each row execute function private.new_auth_profile();
insert into public.profiles(id,display_name,email) select id,coalesce(raw_user_meta_data->>'display_name','Account'),email from auth.users
on conflict(id) do update set email=excluded.email;

-- Lock down every exposed application table, including join and operational tables
-- omitted by the first migration. Replace its overly broad "any staff" policy.
do $$ declare t text; pol record; begin
 for t in select tablename from pg_tables where schemaname='public' loop
   execute format('alter table public.%I enable row level security',t);
   for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop
     execute format('drop policy %I on public.%I',pol.policyname,t);
   end loop;
   execute format('revoke all on table public.%I from anon, authenticated',t);
   execute format('grant all on table public.%I to service_role',t);
 end loop;
end $$;

grant select on public.branches,public.services,public.content_items,public.content_revisions,public.forms,public.form_versions,public.form_fields,public.form_bindings to anon,authenticated;
create policy public_branches on public.branches for select to anon,authenticated using(active);
create policy public_services on public.services for select to anon,authenticated using(active);
create policy public_content on public.content_items for select to anon,authenticated using(status='published');
create policy public_content_revision on public.content_revisions for select to anon,authenticated using(exists(select 1 from public.content_items i where i.published_revision_id=content_revisions.id and i.id=content_revisions.content_id and i.status='published'));
create policy public_forms on public.forms for select to anon,authenticated using(status='published');
create policy public_versions on public.form_versions for select to anon,authenticated using(state='published' and exists(select 1 from public.forms f where f.id=form_versions.form_id and f.current_version_id=form_versions.id and f.status='published'));
create policy public_fields on public.form_fields for select to anon,authenticated using(exists(select 1 from public.forms f where f.current_version_id=form_version_id and f.status='published'));
create policy public_bindings on public.form_bindings for select to anon,authenticated using(active);

-- Public reads must not expose draft content or field/routing configuration.
revoke select on public.content_items,public.forms from anon,authenticated;
grant select(id,kind,path,title,status,published_revision_id,published_at,parent_id,created_at,updated_at,revision) on public.content_items to anon,authenticated;
grant select(id,slug,title,status,current_version_id,owner_branch_id,created_at,updated_at,revision) on public.forms to anon,authenticated;

grant select on public.profiles,public.roles,public.permissions,public.role_permissions,public.user_roles,public.user_branch_access,public.user_permissions,public.customers,public.customer_contacts,public.submissions,public.submission_reviews,public.submission_corrections,public.file_objects,public.submission_files,public.appointments,public.appointment_requests,public.staff_resources,public.audit_events,public.notification_jobs,public.newsletter_subscriptions,public.legacy_import_batches,public.legacy_mappings to authenticated;
create policy own_profile on public.profiles for select to authenticated using(id=auth.uid() or public.admin_can('users.manage'));
do $$ declare t text; begin
 foreach t in array array['roles','permissions','role_permissions'] loop
 execute format('create policy access_catalog on public.%I for select to authenticated using(public.admin_can(''users.manage''))',t);
 end loop;
 foreach t in array array['user_roles','user_branch_access','user_permissions'] loop
 execute format('create policy own_access on public.%I for select to authenticated using(user_id=auth.uid() or public.admin_can(''users.manage''))',t);
 end loop;
end $$;
create policy admin_submissions on public.submissions for select to authenticated using(public.admin_can('submissions.read',branch_id));
create policy admin_customers on public.customers for select to authenticated using(public.admin_can('customers.read',branch_id));
create policy admin_contacts on public.customer_contacts for select to authenticated using(exists(select 1 from public.customers c where c.id=customer_id and public.admin_can('customers.read',c.branch_id)));
create policy admin_reviews on public.submission_reviews for select to authenticated using(exists(select 1 from public.submissions s where s.id=submission_id and public.admin_can('submissions.read',s.branch_id)));
create policy admin_corrections on public.submission_corrections for select to authenticated using(exists(select 1 from public.submissions s where s.id=submission_id and public.admin_can('submissions.read',s.branch_id)));
create policy admin_submission_files on public.submission_files for select to authenticated using(exists(select 1 from public.submissions s where s.id=submission_id and public.admin_can('documents.read',s.branch_id)));
create policy admin_files on public.file_objects for select to authenticated using(exists(select 1 from public.submission_files sf join public.submissions s on s.id=sf.submission_id where sf.file_id=file_objects.id and public.admin_can('documents.read',s.branch_id)));
create policy admin_appointments on public.appointments for select to authenticated using(public.admin_can('bookings.read',branch_id));
create policy admin_requests on public.appointment_requests for select to authenticated using(public.admin_can('bookings.read',branch_id));
create policy admin_staff_resources on public.staff_resources for select to authenticated using(public.admin_can('bookings.read',branch_id));
create policy admin_audit on public.audit_events for select to authenticated using(public.admin_can('audit.read',branch_id));
create policy admin_notifications on public.notification_jobs for select to authenticated using(public.admin_can('settings.manage'));
create policy admin_newsletter on public.newsletter_subscriptions for select to authenticated using(public.admin_can('reports.read'));
create policy admin_imports on public.legacy_import_batches for select to authenticated using(public.admin_can('migrations.manage'));
create policy admin_mappings on public.legacy_mappings for select to authenticated using(public.admin_can('migrations.manage'));
create policy admin_content on public.content_items for select to authenticated using(public.admin_can('content.edit'));
create policy admin_content_versions on public.content_revisions for select to authenticated using(public.admin_can('content.edit'));
create policy admin_forms on public.forms for select to authenticated using(public.admin_can('forms.edit'));
create policy admin_form_versions on public.form_versions for select to authenticated using(public.admin_can('forms.edit'));

-- Drafts are available only through this permission-checked projection.
create or replace function public.admin_draft(kind text, target uuid) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if kind='content' and public.admin_can('content.edit') then
 return (select to_jsonb(c) from public.content_items c where id=target);
 elsif kind='forms' and public.admin_can('forms.edit') then
 return (select to_jsonb(f) from public.forms f where id=target);
 end if;
 raise exception 'Access denied' using errcode='42501';
end $$;

-- Atomic review/correction keeps original answers immutable and checks revision.
create or replace function public.admin_review_submission(target uuid, expected_revision integer, new_status text, note text, correction bytea default null, correction_meta jsonb default null) returns integer
language plpgsql security definer set search_path='' as $$
declare s public.submissions; v integer;
begin
 select * into s from public.submissions where id=target for update;
 if not found or not public.admin_can('submissions.review',s.branch_id) then raise exception 'Access denied' using errcode='42501'; end if;
 if s.revision<>expected_revision then raise exception 'Record changed; refresh before saving' using errcode='40001'; end if;
 if new_status not in ('received','under_review','action_required','processed','archived') or length(note)>2000 then raise exception 'Invalid review'; end if;
 if correction is not null and (not public.admin_can('submissions.correct',s.branch_id) or length(trim(note))<5) then raise exception 'Correction permission and reason required' using errcode='42501'; end if;
 v:=s.revision+1;
 if correction is not null then
 insert into public.submission_corrections(submission_id,revision,answers_ciphertext,encryption_meta,reason,actor_id) values(target,v,correction,correction_meta,note,auth.uid());
 end if;
 insert into public.submission_reviews(submission_id,author_id,status_from,status_to,note_text) values(target,auth.uid(),s.status,new_status,note);
 update public.submissions set status=new_status,revision=v,reviewed_by=auth.uid(),updated_at=now() where id=target;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,branch_id,safe_metadata) values(auth.uid(),case when correction is null then 'submission.reviewed' else 'submission.corrected' end,'submission',target,s.branch_id,jsonb_build_object('revision',v,'status',new_status));
 return v;
end $$;

create or replace function public.admin_save_content(target uuid, expected_revision integer, document jsonb, metadata jsonb, publish boolean default false) returns integer
language plpgsql security definer set search_path='' as $$
declare c public.content_items; v integer; r uuid;
begin
 if not public.admin_can('content.edit') or (publish and not public.admin_can('content.publish')) then raise exception 'Access denied' using errcode='42501'; end if;
 select * into c from public.content_items where id=target for update;
 if not found or c.revision<>expected_revision then raise exception 'Content changed; refresh before saving' using errcode='40001'; end if;
 if jsonb_typeof(document) not in ('array','object') or pg_column_size(document)>131072 or pg_column_size(metadata)>8192 then raise exception 'Invalid content'; end if;
 v:=c.revision+1;
 if publish then
 insert into public.content_revisions(content_id,revision,blocks,seo,created_by) values(target,v,document,metadata,auth.uid()) returning id into r;
 update public.content_items set published_revision_id=r,status='published',published_at=now(),draft_blocks=null,draft_seo=null,revision=v,updated_at=now() where id=target;
 else update public.content_items set draft_blocks=document,draft_seo=metadata,revision=v,updated_at=now() where id=target; end if;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,safe_metadata) values(auth.uid(),case when publish then 'content.published' else 'content.draft_saved' end,'content',target,jsonb_build_object('revision',v));
 return v;
end $$;

create or replace function public.admin_save_form(target uuid, expected_revision integer, definition jsonb, publish boolean default false) returns integer
language plpgsql security definer set search_path='' as $$
declare f public.forms; v integer; version_no integer; r uuid;
begin
 if not public.admin_can('forms.edit') or (publish and not public.admin_can('forms.publish')) then raise exception 'Access denied' using errcode='42501'; end if;
 select * into f from public.forms where id=target for update;
 if not found or f.revision<>expected_revision then raise exception 'Form changed; refresh before saving' using errcode='40001'; end if;
 if definition->>'engine'<>'managed' or jsonb_typeof(definition->'fields')<>'array' or jsonb_array_length(definition->'fields')>100 or pg_column_size(definition)>131072 then raise exception 'Invalid form definition'; end if;
 if publish and definition->>'reviewedLegacy'<>'true' then raise exception 'Original form review required before publishing'; end if;
 v:=f.revision+1;
 if publish then
 select coalesce(max(version),0)+1 into version_no from public.form_versions where form_id=target;
 insert into public.form_versions(form_id,version,schema_json,schema_hash,state,created_by,published_by) values(target,version_no,definition,encode(sha256(convert_to(definition::text,'UTF8')),'hex'),'published',auth.uid(),auth.uid()) returning id into r;
 update public.forms set current_version_id=r,status='published',draft_schema=null,revision=v,updated_at=now() where id=target;
 else update public.forms set draft_schema=definition,revision=v,updated_at=now() where id=target; end if;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,safe_metadata) values(auth.uid(),case when publish then 'form.published' else 'form.draft_saved' end,'form',target,jsonb_build_object('revision',v));
 return v;
end $$;

create or replace function public.admin_resolve_request(target uuid, new_status text, note text) returns void
language plpgsql security definer set search_path='' as $$
declare b uuid; begin
 select branch_id into b from public.appointment_requests where id=target for update;
 if not found or not public.admin_can('bookings.manage',b) then raise exception 'Access denied' using errcode='42501'; end if;
 -- A preference is not a reserved appointment. Booking requires the scheduling service.
 if new_status not in ('pending','contacted','closed') or length(note)>2000 then raise exception 'Invalid request status'; end if;
 update public.appointment_requests set status=new_status,owner_note=note,updated_at=now() where id=target;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,branch_id) values(auth.uid(),'appointment_request.updated','appointment_request',target,b);
end $$;

create or replace function public.admin_save_customer(target uuid, expected_revision integer, new_name text, new_status text, target_branch uuid) returns void
language plpgsql security definer set search_path='' as $$
declare c public.customers; begin
 select * into c from public.customers where id=target for update;
 if not found or not public.admin_can('customers.manage',c.branch_id) or not public.admin_can('customers.manage',target_branch) then raise exception 'Access denied' using errcode='42501'; end if;
 if c.revision<>expected_revision then raise exception 'Record changed; refresh' using errcode='40001'; end if;
 if length(trim(new_name)) not between 1 and 200 or new_status not in ('active','inactive') or target_branch is null then raise exception 'Invalid customer'; end if;
 update public.customers set display_name=new_name,status=new_status,branch_id=target_branch,revision=revision+1,updated_at=now() where id=target;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,branch_id) values(auth.uid(),'customer.updated','customer',target,target_branch);
end $$;

create or replace function public.admin_set_staff_access(target uuid, grants text[], branch_ids uuid[], enabled boolean) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not public.admin_can('users.manage') or not exists(select 1 from public.user_roles where user_id=auth.uid() and role_id='owner') or target=auth.uid() or exists(select 1 from public.user_roles where user_id=target and role_id='owner') then raise exception 'Access denied; owner access cannot be changed here' using errcode='42501'; end if;
 if exists(select 1 from unnest(grants) g where not exists(select 1 from public.permissions p where p.code=g)) then raise exception 'Invalid permission'; end if;
 update public.profiles set status=case when enabled then 'active' else 'suspended' end where id=target;
 if not found then raise exception 'Account not found'; end if;
 delete from public.user_roles where user_id=target;
 delete from public.user_permissions where user_id=target;
 delete from public.user_branch_access where user_id=target;
 if enabled then
 insert into public.user_roles(user_id,role_id,granted_by) values(target,'staff',auth.uid());
 insert into public.user_permissions select target,g from unnest(grants) g;
 insert into public.user_branch_access select target,b from unnest(branch_ids) b;
 end if;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,safe_metadata) values(auth.uid(),'staff.access_changed','profile',target,jsonb_build_object('enabled',enabled,'permissions',grants,'branches',branch_ids));
end $$;

-- First owner is provisioned by an authenticated operator using the server key,
-- after creating the exact Auth account. No "first visitor becomes owner" path.
create or replace function public.bootstrap_workspace_owner(target uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(83712499);
 if exists(select 1 from public.user_roles where role_id='owner') then raise exception 'An owner already exists'; end if;
 if not exists(select 1 from auth.users where id=target and email_confirmed_at is not null) then raise exception 'Confirmed Auth account required'; end if;
 insert into public.profiles(id,display_name,email) select id,'Owner',email from auth.users where id=target on conflict(id) do update set status='active';
 insert into public.user_roles(user_id,role_id) values(target,'owner');
 insert into public.audit_events(actor_id,action,entity_type,entity_id) values(target,'owner.provisioned','profile',target);
end $$;

-- Public intake is a single service-only transaction: no partial receipt, contact
-- auto-merge or fake "form id as version id" fallback.
create or replace function public.accept_workspace_submission(p_form uuid,p_version uuid,p_branch uuid,p_reference text,p_summary jsonb,p_cipher bytea,p_meta jsonb,p_key text,p_hash text,p_preferences jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_id uuid; c uuid; previous public.idempotency_requests; begin
 if p_key is not null then
 perform pg_advisory_xact_lock(hashtextextended(p_key,0));
 select * into previous from public.idempotency_requests where scope='intake' and subject_hash=p_form::text and request_key=p_key;
 if found then
 if previous.payload_hash<>p_hash then raise exception 'Idempotency key reused with different data' using errcode='23505'; end if;
 return (select jsonb_build_object('id',id,'reference',reference) from public.submissions where id=previous.result_id);
 end if;
 end if;
 if not exists(select 1 from public.form_versions where id=p_version and form_id=p_form and state='published') or not exists(select 1 from public.branches where id=p_branch and active) then raise exception 'Invalid submission context'; end if;
 insert into public.customers(display_name,branch_id) values(p_summary->>'applicant_name',p_branch) returning id into c;
 insert into public.customer_contacts(customer_id,kind,value,normalised_value,is_primary) values(c,'email',p_summary->>'applicant_email',lower(trim(p_summary->>'applicant_email')),true);
 insert into public.submissions(reference,form_id,form_version_id,customer_id,branch_id,answers_ciphertext,encryption_meta,encryption_key_ref,safe_summary)
 values(p_reference,p_form,p_version,c,p_branch,p_cipher,p_meta,'env:v1',p_summary) returning id into v_id;
 if p_preferences is not null then insert into public.appointment_requests(submission_id,customer_id,branch_id,preferences) values(v_id,c,p_branch,p_preferences); end if;
 if p_key is not null then insert into public.idempotency_requests(scope,subject_hash,request_key,payload_hash,result_type,result_id,expires_at) values('intake',p_form::text,p_key,p_hash,'submission',v_id,now()+interval '1 day'); end if;
 insert into public.audit_events(action,entity_type,entity_id,branch_id) values('submission.received','submission',v_id,p_branch);
 return jsonb_build_object('id',v_id,'reference',p_reference);
end $$;

-- Revoke PostgreSQL's default PUBLIC execute on every app-owned function.
do $$ declare f record; begin
 for f in select p.proname name,p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('admin_draft','admin_review_submission','admin_save_content','admin_save_form','admin_resolve_request','admin_save_customer','admin_set_staff_access','bootstrap_workspace_owner','accept_workspace_submission') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 if f.name in ('bootstrap_workspace_owner','accept_workspace_submission') then execute format('grant execute on function %s to service_role',f.signature);
 else execute format('grant execute on function %s to authenticated',f.signature); end if;
 end loop;
end $$;

-- Correct the foundation's placeholder offices from the existing public website.
update public.branches set name='Adelaide',address='{"street":"Shop 3, 160 Hampstead Road","city":"Broadview","state":"SA","postcode":"5083"}',public_contacts='{"phone":"08 7076 9899","email":"info@rcorpo.com"}' where code='ADE';
update public.branches set address='{"street":"22 Van Dieren Road","city":"Pallara","state":"QLD","postcode":"4110"}',public_contacts='{"phone":"07 2102 9899","email":"info@rcorpo.com"}' where code='BNE';
update public.branches set address='{"street":"440A Morley Drive","city":"Morley","state":"WA","postcode":"6062"}',public_contacts='{"phone":"08 6373 5181","email":"info@rcorpo.com"}' where code='PER';
commit;
