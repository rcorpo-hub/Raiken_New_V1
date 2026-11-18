begin;
create or replace function private.sync_form_title() returns trigger language plpgsql set search_path='' as $$
declare document jsonb; begin
 if new.current_version_id is distinct from old.current_version_id then
 select schema_json into document from public.form_versions where id=new.current_version_id and form_id=new.id;
 if document->>'engine'='managed' and length(document->>'title') between 1 and 160 then new.title:=document->>'title'; end if;
 end if;return new;
end $$;
create trigger sync_form_title before update on public.forms for each row execute function private.sync_form_title();
create or replace function private.sync_page_title() returns trigger language plpgsql set search_path='' as $$
declare document jsonb; begin
 if new.published_revision_id is distinct from old.published_revision_id and (new.kind='post' or new.path like '/pages/%') then
 select blocks into document from public.content_revisions where id=new.published_revision_id and content_id=new.id;
 if length(document->>'title') between 1 and 160 then new.title:=document->>'title'; end if;
 end if;return new;
end $$;
create trigger sync_page_title before update on public.content_items for each row execute function private.sync_page_title();
commit;
