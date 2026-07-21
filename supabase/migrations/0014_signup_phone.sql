-- Capture le numéro WhatsApp directement à l'inscription (posé via
-- raw_user_meta_data par signUp({ options: { data: { phone } } }), même
-- canal déjà utilisé pour referral_code depuis 0006) — jusqu'ici `phone`
-- (0013) n'était rempli qu'à la main par un admin après coup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referral_code text;
  v_referrer_id uuid;
  v_phone text;
  v_attempts int := 0;
begin
  v_referral_code := nullif(upper(trim(new.raw_user_meta_data ->> 'referral_code')), '');
  v_phone := nullif(trim(new.raw_user_meta_data ->> 'phone'), '');

  if v_referral_code is not null then
    select id into v_referrer_id from public.profiles where affiliate_code = v_referral_code;
  end if;

  loop
    begin
      insert into public.profiles (id, email, affiliate_code, referred_by, phone)
      values (new.id, new.email, public.generate_affiliate_code(), v_referrer_id, v_phone);
      exit;
    exception when unique_violation then
      v_attempts := v_attempts + 1;
      if v_attempts >= 5 then raise; end if;
    end;
  end loop;

  return new;
end;
$$;
-- Le trigger on_auth_user_created pointe déjà sur cette fonction par nom —
-- CREATE OR REPLACE suffit.
