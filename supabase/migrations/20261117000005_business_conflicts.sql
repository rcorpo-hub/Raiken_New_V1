-- Business revision conflicts must not masquerade as retryable serialization errors.
-- PT409 is PostgREST's explicit HTTP 409 convention.
begin;
do $$ declare fn record; begin
 for fn in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname in ('admin_review_submission','admin_save_content','admin_save_form','admin_save_customer') loop
 execute replace(pg_get_functiondef(fn.oid),'''40001''','''PT409''');
 end loop;
end $$;
commit;
