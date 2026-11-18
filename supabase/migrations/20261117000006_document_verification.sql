begin;
-- New or legacy unverified file metadata must never imply a successful scan.
alter table public.file_objects alter column scan_status set default 'pending';
update public.file_objects set scan_status='pending'
where scan_status='clean' and (scan_engine is null or scanned_at is null or verified_mime is null);
create or replace function public.admin_record_access(kind text,target uuid,reason text default '') returns void
language plpgsql security definer set search_path='' as $$
declare branch uuid; begin
 if kind in ('submission.read_authorized','submission.summary_exported') then
 select branch_id into branch from public.submissions where id=target;
 if not found or not public.admin_can(case when kind='submission.summary_exported' then 'submissions.export' else 'submissions.read' end,branch) then raise exception 'Access denied' using errcode='42501'; end if;
 elsif kind='document.download_authorized' then
 select s.branch_id into branch from public.file_objects f join public.submission_files sf on sf.file_id=f.id join public.submissions s on s.id=sf.submission_id
 where f.id=target and f.scan_status='clean' and f.scan_engine is not null and f.scanned_at is not null and f.verified_mime is not null and f.bucket='verified-documents' and public.admin_can('documents.download',s.branch_id) limit 1;
 if not found then raise exception 'Only permitted verified files may be downloaded' using errcode='42501'; end if;
 else raise exception 'Invalid access event'; end if;
 if length(reason)>500 then raise exception 'Invalid reason'; end if;
 insert into public.audit_events(actor_id,action,entity_type,entity_id,branch_id,safe_metadata) values(auth.uid(),kind,case when kind like 'document.%' then 'document' else 'submission' end,target,branch,jsonb_build_object('reason',reason));
end $$;
revoke all on function public.admin_record_access(text,uuid,text) from public,anon;
grant execute on function public.admin_record_access(text,uuid,text) to authenticated;
commit;
