-- Unified conveyancing intake. Personal answers use the existing encrypted
-- submission store; provider IDs/statuses and durable work are linked by UUID.
create table public.conveyancing_sessions (
 id uuid primary key default gen_random_uuid(), token_hash text not null,
 form_version_id uuid not null references public.form_versions(id),
 answers_ciphertext bytea, encryption_meta jsonb, current_step integer not null default 1 check(current_step between 1 and 5),
 party_index integer not null default 0 check(party_index between 0 and 5), revision integer not null default 0,
 submitted_submission_id uuid references public.submissions(id), submitted_hash text,
 expires_at timestamptz not null default now()+interval '1 day', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.conveyancing_cases (
 submission_id uuid primary key references public.submissions(id) on delete restrict,
 session_id uuid not null unique references public.conveyancing_sessions(id),
 send_status text not null default 'pending_send' check(send_status in ('pending_send','sent','send_error','needs_reconciliation')),
 send_phase text not null default 'queued' check(send_phase in ('queued','creating','created','starting','sent')),
 livesign_envelope_id uuid unique, envelope_status text,
 verification_status text not null default 'unverified' check(verification_status in ('unverified','verified','failed','needs_review')),
 aml_status text, aml_risk_rating text, last_synced_at timestamptz, error_code text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.conveyancing_people (
 id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.conveyancing_cases(submission_id) on delete restrict,
 party_id text not null, party_index integer not null check(party_index between 0 and 5), livesign_customer_id uuid,
 status text not null default 'unverified' check(status in ('unverified','verified','failed','needs_review')),
 voi_outcome text, voi_review_status text, has_flagged_items boolean not null default false, updated_at timestamptz not null default now(),
 unique(submission_id,party_id), unique(submission_id,party_index)
);
create table public.conveyancing_jobs (
 id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.conveyancing_cases(submission_id),
 event_key text not null unique, kind text not null check(kind in ('send','sync','email')), payload jsonb not null default '{}',
 state text not null default 'pending' check(state in ('pending','processing','done','failed','needs_reconciliation')),
 attempts integer not null default 0, run_after timestamptz not null default now(), lease_token uuid, lease_until timestamptz,
 error_code text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index conveyancing_jobs_due on public.conveyancing_jobs(run_after) where state in ('pending','processing');
create table public.conveyancing_events (
 id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.conveyancing_cases(submission_id),
 event_key text not null unique, kind text not null, safe_metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
do $$ declare t text; begin
 foreach t in array array['conveyancing_sessions','conveyancing_cases','conveyancing_people','conveyancing_jobs','conveyancing_events'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
 foreach t in array array['conveyancing_cases','conveyancing_people','conveyancing_jobs','conveyancing_events'] loop
  execute format('grant select on public.%I to authenticated',t);
  execute format('create policy scoped_conveyancing_read on public.%I for select to authenticated using (exists(select 1 from public.submissions s where s.id=submission_id and public.admin_can(''submissions.read'',s.branch_id)))',t);
 end loop;
end $$;

-- Register a dedicated renderer. Old definitions remain for historical records.
do $$ declare f uuid; v uuid; definition jsonb:='{"engine":"conveyancing-v1","title":"New Client Conveyancing Form","description":"Buying or selling a property. Complete one form for everyone involved.","fields":[]}'::jsonb; begin
 insert into public.forms(slug,title,status,directory_category)
 values('conveyancing-intake','New Client Conveyancing Form','draft','Conveyancing')
 on conflict(slug) do update set directory_category='Conveyancing' returning id into f;
 select current_version_id into v from public.forms where id=f;
 if v is null then
  insert into public.form_versions(form_id,version,state,schema_json,schema_hash)
  values(f,1,'published',definition,encode(sha256(convert_to(definition::text,'UTF8')),'hex')) returning id into v;
  update public.forms set current_version_id=v,status='published',revision=1 where id=f;
 end if;
 update public.forms set status='archived' where slug in ('i-am-purchaser','i-am-vendor');
end $$;

create function public.accept_conveyancing_submission(p_session uuid,p_token_hash text,p_hash text,p_reference text,p_summary jsonb,p_cipher bytea,p_meta jsonb,p_people jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare draft public.conveyancing_sessions; f uuid; branch uuid; accepted jsonb; person jsonb; idx integer:=0;
begin
 select * into draft from public.conveyancing_sessions where id=p_session and token_hash=p_token_hash and expires_at>now() for update;
 if not found then raise exception 'Session unavailable' using errcode='42501'; end if;
 if draft.submitted_submission_id is not null then
  if draft.submitted_hash<>p_hash then raise exception 'Conflicting retry' using errcode='23505'; end if;
  return (select jsonb_build_object('id',s.id,'reference',s.reference) from public.submissions s where s.id=draft.submitted_submission_id);
 end if;
 select id into f from public.forms where slug='conveyancing-intake' and status='published' and current_version_id=draft.form_version_id;
 select id into branch from public.branches where code='ADE' and active;
 if f is null or branch is null or jsonb_typeof(p_people)<>'array' or jsonb_array_length(p_people) not between 1 and 6 then raise exception 'Invalid intake context'; end if;
 accepted:=public.accept_workspace_submission(f,draft.form_version_id,branch,p_reference,p_summary,p_cipher,p_meta,p_session::text,p_hash,null);
 insert into public.conveyancing_cases(submission_id,session_id) values((accepted->>'id')::uuid,p_session);
 for person in select value from jsonb_array_elements(p_people) loop
  if length(person->>'id') not between 1 and 80 then raise exception 'Invalid person identifier'; end if;
  insert into public.conveyancing_people(submission_id,party_id,party_index) values((accepted->>'id')::uuid,person->>'id',idx);idx:=idx+1;
 end loop;
 insert into public.conveyancing_jobs(submission_id,event_key,kind) values((accepted->>'id')::uuid,'send:'||(accepted->>'id'),'send');
 insert into public.conveyancing_events(submission_id,event_key,kind) values((accepted->>'id')::uuid,'received:'||(accepted->>'id'),'form_received');
 update public.conveyancing_sessions set submitted_submission_id=(accepted->>'id')::uuid,submitted_hash=p_hash,answers_ciphertext=null,encryption_meta=null,updated_at=now() where id=p_session;
 return accepted;
end $$;

create function public.claim_conveyancing_jobs(p_limit integer default 1) returns setof public.conveyancing_jobs
language sql security definer set search_path='' as $$
 update public.conveyancing_jobs j set state='processing',attempts=attempts+1,lease_token=gen_random_uuid(),lease_until=now()+interval '5 minutes',updated_at=now()
 where j.id in (select id from public.conveyancing_jobs where (state='pending' and run_after<=now()) or (state='processing' and lease_until<now()) order by run_after for update skip locked limit least(greatest(p_limit,1),3))
 returning j.*;
$$;
create function public.wake_conveyancing_sync(target uuid) returns void
language sql security definer set search_path='' as $$
 insert into public.conveyancing_jobs(submission_id,event_key,kind) select submission_id,'sync:'||submission_id,'sync' from public.conveyancing_cases where submission_id=target and livesign_envelope_id is not null
 on conflict(event_key) do update set state=case when conveyancing_jobs.state='processing' then 'processing' else 'pending' end,run_after=now(),updated_at=now();
$$;
-- Critical fields are implemented by the dedicated workflow, not the basic editor.
create function public.protect_conveyancing_definition() returns trigger language plpgsql set search_path='' as $$
begin
 if exists(select 1 from public.forms where id=new.form_id and slug='conveyancing-intake') and new.schema_json->>'engine' is distinct from 'conveyancing-v1' then raise exception 'The conveyancing workflow is protected' using errcode='42501'; end if;
 return new;
end $$;
create trigger protect_conveyancing_definition before insert or update on public.form_versions for each row execute function public.protect_conveyancing_definition();
-- No new corrections: status and private notes remain available. Historical
-- corrections are retained and still readable under existing branch permissions.
create or replace function public.admin_review_submission(target uuid,expected_revision integer,new_status text,note text,correction bytea default null,correction_meta jsonb default null) returns integer
language plpgsql security definer set search_path='' as $$
declare s public.submissions; v integer; begin
 if correction is not null or correction_meta is not null then raise exception 'Submitted answers are read only' using errcode='42501'; end if;
 select * into s from public.submissions where id=target for update;
 if not found or not public.admin_can('submissions.review',s.branch_id) then raise exception 'Access denied' using errcode='42501'; end if;
 if s.revision<>expected_revision then raise exception 'Revision conflict' using errcode='PT409'; end if;
 if new_status not in ('received','under_review','action_required','processed','archived') or length(note)>2000 then raise exception 'Invalid review'; end if;
 v:=s.revision+1;
 insert into public.submission_reviews(submission_id,author_id,status_from,status_to,note_text) values(target,auth.uid(),s.status,new_status,note);
 update public.submissions set status=new_status,revision=v,reviewed_by=auth.uid(),updated_at=now() where id=target;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,branch_id,safe_metadata) values(auth.uid(),'submission.reviewed','submission',target,s.branch_id,jsonb_build_object('revision',v,'status',new_status));
 return v;
end $$;
delete from public.role_permissions where permission_code='submissions.correct';
delete from public.user_permissions where permission_code='submissions.correct';
delete from public.permissions where code='submissions.correct';
do $$ declare f record; begin
 for f in select p.oid::regprocedure signature,p.proname name from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('accept_conveyancing_submission','claim_conveyancing_jobs','wake_conveyancing_sync','protect_conveyancing_definition') loop
  execute format('revoke all on function %s from public,anon,authenticated',f.signature);
  execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;

-- Approved retirement must also hold through direct authenticated form RPCs.
create function public.protect_retired_conveyancing_forms() returns trigger language plpgsql set search_path='' as $$
begin
 if old.slug in ('i-am-purchaser','i-am-vendor') and new.status='published' then raise exception 'This form is retired' using errcode='42501'; end if;
 return new;
end $$;
create trigger protect_retired_conveyancing_forms before update on public.forms for each row execute function public.protect_retired_conveyancing_forms();
revoke all on function public.protect_retired_conveyancing_forms() from public,anon,authenticated;
grant execute on function public.protect_retired_conveyancing_forms() to service_role;
