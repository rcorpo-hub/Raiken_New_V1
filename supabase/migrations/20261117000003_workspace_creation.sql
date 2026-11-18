begin;
alter table public.forms add column if not exists directory_category text not null default 'General' check(directory_category in ('Registration','Taxation','Corporate','Trusts','Conveyancing','General'));
grant select(directory_category) on public.forms to anon,authenticated;
create or replace function public.admin_create_item(kind text,slug text,title text,category text default 'General') returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid; begin
 if slug!~'^[a-z][a-z0-9-]{0,79}$' or length(trim(title)) not between 1 and 160 then raise exception 'Invalid title or URL'; end if;
 if kind='form' then
  if not public.admin_can('forms.edit') then raise exception 'Access denied' using errcode='42501'; end if;
  insert into public.forms(slug,title,status,directory_category) values(slug,title,'draft',category) returning id into result;
 elsif kind in ('page','post') then
  if not public.admin_can('content.edit') then raise exception 'Access denied' using errcode='42501'; end if;
  insert into public.content_items(kind,path,title,status,published_at) values(kind,case when kind='page' then '/pages/' else '/blog/' end||slug,title,'draft',null) returning id into result;
 else raise exception 'Unsupported item type'; end if;
 insert into public.audit_events(actor_id,action,entity_type,entity_id) values(auth.uid(),kind||'.created',kind,result);
 return result;
end $$;
revoke all on function public.admin_create_item(text,text,text,text) from public,anon;
grant execute on function public.admin_create_item(text,text,text,text) to authenticated;
commit;
