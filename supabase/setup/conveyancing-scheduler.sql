-- Optional hosted setup; deliberately separate from migrations.
-- Create secrets privately in Supabase Vault first:
-- raikan_app_url: canonical HTTPS origin, without trailing slash
-- raikan_worker_secret: same random >=32-character CRON_SECRET as Vercel
-- Keep LIVESIGN_MODE=disabled during setup.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
do $$ begin
 if not exists(select 1 from vault.decrypted_secrets where name='raikan_app_url' and decrypted_secret~'^https://[^/]+$')
 or not exists(select 1 from vault.decrypted_secrets where name='raikan_worker_secret' and length(decrypted_secret)>=32)
 then raise exception 'Configure the canonical HTTPS origin and worker secret in Vault first'; end if;
end $$;
select cron.schedule(
 'raikan-conveyancing-worker','* * * * *',
 $job$
 select net.http_post(
  url:=(select decrypted_secret from vault.decrypted_secrets where name='raikan_app_url')||'/api/conveyancing/worker',
  headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='raikan_worker_secret')),
  body:='{}'::jsonb,timeout_milliseconds:=300000
 );
 $job$
);
