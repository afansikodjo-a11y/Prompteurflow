-- Le programme d'affiliation passe d'un accès automatique à tous (0006/0007)
-- à un accès sur demande : chaque compte reste sans effet tant qu'un admin
-- ne l'a pas explicitement activé, par email.

alter table public.profiles add column is_affiliate boolean not null default false;

-- Index partiel : peu de lignes seront jamais à true, filtré par le panneau
-- admin à chaque chargement (même style que profiles_referred_by_idx).
create index profiles_is_affiliate_idx on public.profiles (is_affiliate) where is_affiliate;

-- `profiles` n'a volontairement AUCUNE policy d'update client depuis
-- 0001_init.sql — le point le plus sensible du schéma, pour qu'aucun
-- utilisateur ne puisse jamais s'auto-modifier (en particulier `role`) via
-- le SDK. Cette nouvelle policy reste strictement admin-only (using/with
-- check is_admin()) — n'affaiblit rien pour un utilisateur non-admin, qui
-- n'a toujours aucun moyen d'écrire sur sa propre ligne.
create policy "profiles: is_affiliate modifiable par un admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- GRANT restreint à cette seule colonne (pas `grant update on profiles`
-- tout court) : même si la RLS ci-dessus est déjà admin-only, un GRANT
-- au niveau colonne garantit qu'aucune voie future (bug, nouvelle requête)
-- ne peut jamais toucher `role` via ce chemin — l'invariant "role jamais
-- modifiable côté client" de 0001_init.sql reste intact à la lettre.
grant update (is_affiliate) on public.profiles to authenticated;

-- Le calcul de commission ne récompense désormais que les parrains
-- explicitement activés — `affiliate_code` existe pour tout le monde
-- depuis 0006 (généré à l'inscription), mais un code non activé ne doit
-- jamais générer de commission même s'il a été partagé/deviné.
create or replace function public.compute_affiliate_commission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer_id uuid;
  v_referrer_is_affiliate boolean;
  v_rate numeric(5, 2);
begin
  if new.status <> 'succeeded' or new.user_id is null then
    return new;
  end if;

  select referred_by into v_referrer_id from public.profiles where id = new.user_id;
  if v_referrer_id is null then
    return new;
  end if;

  select is_affiliate into v_referrer_is_affiliate from public.profiles where id = v_referrer_id;
  if v_referrer_is_affiliate is not true then
    return new;
  end if;

  select commission_rate_percent into v_rate from public.affiliate_settings where id = true;
  if v_rate is null or v_rate <= 0 then
    return new;
  end if;

  insert into public.affiliate_commissions
    (affiliate_id, referred_user_id, transaction_id, amount_xof, rate_applied, status)
  values
    (v_referrer_id, new.user_id, new.id, round(new.amount_xof * v_rate / 100.0)::integer, v_rate, 'accrued')
  on conflict (transaction_id) do nothing;

  return new;
end;
$$;
-- Le trigger on_transaction_succeeded_compute_commission (0007) pointe déjà
-- sur cette fonction par nom — CREATE OR REPLACE suffit.
