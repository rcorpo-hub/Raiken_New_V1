begin;
create or replace function public.workspace_throttle(bucket text, ceiling integer default 30) returns boolean
language plpgsql security definer set search_path='' as $$
declare hits integer; win timestamptz:=date_trunc('minute',now()); begin
 insert into public.rate_limit_buckets(key_hash,window_start,count,expires_at) values(bucket,win,1,win+interval '2 minutes')
 on conflict(key_hash,window_start) do update set count=public.rate_limit_buckets.count+1 returning count into hits;
 return hits<=ceiling;
end $$;
revoke all on function public.workspace_throttle(text,integer) from public,anon,authenticated;
grant execute on function public.workspace_throttle(text,integer) to service_role;

create or replace function public.admin_record_access(kind text,target uuid,reason text default '') returns void
language plpgsql security definer set search_path='' as $$
declare branch uuid; begin
 if kind in ('submission.read_authorized','submission.summary_exported') then
 select branch_id into branch from public.submissions where id=target;
 if not found or not public.admin_can(case when kind='submission.summary_exported' then 'submissions.export' else 'submissions.read' end,branch) then raise exception 'Access denied' using errcode='42501'; end if;
 elsif kind='document.download_authorized' then
 select s.branch_id into branch from public.file_objects f join public.submission_files sf on sf.file_id=f.id join public.submissions s on s.id=sf.submission_id where f.id=target and f.scan_status='clean' and public.admin_can('documents.download',s.branch_id) limit 1;
 if not found then raise exception 'Only permitted clean files may be downloaded' using errcode='42501'; end if;
 else raise exception 'Invalid access event'; end if;
 if length(reason)>500 then raise exception 'Invalid reason'; end if;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,branch_id,safe_metadata) values(auth.uid(),kind,case when kind like 'document.%' then 'document' else 'submission' end,target,branch,jsonb_build_object('reason',reason));
end $$;
revoke all on function public.admin_record_access(text,uuid,text) from public,anon;
grant execute on function public.admin_record_access(text,uuid,text) to authenticated;

-- Published versions and original client answers must not be rewritten.
create or replace function private.reject_frozen_revision() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Published revisions are immutable; publish a new version'; end $$;
drop trigger if exists immutable_content_revision on public.content_revisions;
create trigger immutable_content_revision before update or delete on public.content_revisions for each row execute function private.reject_frozen_revision();
drop trigger if exists immutable_published_form on public.form_versions;
create trigger immutable_published_form before update or delete on public.form_versions for each row when(old.state='published') execute function private.reject_frozen_revision();
create or replace function private.preserve_original_submission() returns trigger language plpgsql set search_path='' as $$
begin
 if new.answers_ciphertext is distinct from old.answers_ciphertext or new.answers_json is distinct from old.answers_json or new.encryption_meta is distinct from old.encryption_meta or new.form_version_id is distinct from old.form_version_id then raise exception 'Original answers and submitted version are immutable'; end if;
 return new;
end $$;
drop trigger if exists immutable_original_submission on public.submissions;
create trigger immutable_original_submission before update on public.submissions for each row execute function private.preserve_original_submission();
commit;
