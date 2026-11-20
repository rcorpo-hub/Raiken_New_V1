-- Approved public menu: six Individual, two Company, two Trust,
-- one combined Conveyancing intake and Appointment booking.
-- Archive registrations only: retain definitions, submissions and their history.
update public.forms set status='archived',updated_at=now()
where slug in (
 'i-am-purchaser','i-am-vendor','residential-property','form-for-vendor-sales',
 'buyer-form','quote-calculator','tax-declaration-form','shiva-family-trust',
 'shree-ashapuri-unit-trust','paarthav-family-trust','digital-signature',
 'contact-us','support'
) and status<>'archived';

drop trigger protect_retired_conveyancing_forms on public.forms;
drop function public.protect_retired_conveyancing_forms();

create function public.protect_retired_public_forms() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.status='published' and new.slug in (
  'i-am-purchaser','i-am-vendor','residential-property','form-for-vendor-sales',
  'buyer-form','quote-calculator','tax-declaration-form','shiva-family-trust',
  'shree-ashapuri-unit-trust','paarthav-family-trust','digital-signature',
  'contact-us','support'
 ) then raise exception 'This form is retired; earlier submissions remain available' using errcode='42501'; end if;
 return new;
end $$;
create trigger protect_retired_public_forms before insert or update on public.forms
for each row execute function public.protect_retired_public_forms();
revoke all on function public.protect_retired_public_forms() from public,anon,authenticated;
grant execute on function public.protect_retired_public_forms() to service_role;
