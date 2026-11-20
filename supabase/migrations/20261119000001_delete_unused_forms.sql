-- Delete the explicitly removed form definitions. Never silently erase submissions on a hosted project.
do $$ begin
 if exists(select 1 from public.submissions s join public.forms f on f.id=s.form_id where f.slug in ('i-am-purchaser','i-am-vendor','residential-property','form-for-vendor-sales','buyer-form','quote-calculator','tax-declaration-form','shiva-family-trust','shree-ashapuri-unit-trust','paarthav-family-trust','digital-signature','contact-us','support')) then
  raise exception 'Removed forms still have submissions. Clean up only approved test data before applying this migration.';
 end if;
end $$;
alter table public.form_versions disable trigger immutable_published_form;
delete from public.forms where slug in ('i-am-purchaser','i-am-vendor','residential-property','form-for-vendor-sales','buyer-form','quote-calculator','tax-declaration-form','shiva-family-trust','shree-ashapuri-unit-trust','paarthav-family-trust','digital-signature','contact-us','support');
alter table public.form_versions enable trigger immutable_published_form;
