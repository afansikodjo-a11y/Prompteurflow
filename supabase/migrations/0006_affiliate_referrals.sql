-- Programme d'affiliation (1/2) : code d'affiliation + attribution du
-- parrain. Indépendant des commissions (0007) — testable seul via le flux
-- de signup, avant même que les transactions existent.

alter table public.profiles add column affiliate_code text;
alter table public.profiles add column referred_by uuid references public.profiles (id);

-- Défense en profondeur : structurellement déjà impossible (la ligne du
-- nouvel utilisateur n'existe pas encore au moment de la résolution du
-- parrain dans handle_new_user), mais coûte rien à vérifier aussi en base.
alter table public.profiles
  add constraint profiles_referred_by_not_self check (referred_by is null or referred_by <> id);

-- Alphabet sans caractères ambigus (0/O, 1/I/L) — 32^8 ≈ 1,1 billion de
-- combinaisons. security definer : doit pouvoir vérifier l'unicité sur
-- toute la table, pas seulement la ligne de l'appelant (RLS bypass requis
-- même si en pratique seul handle_new_user() l'appelle aujourd'hui).
create function public.generate_affiliate_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  candidate text;
  i int;
begin
  loop
    candidate := '';
    for i in 1..8 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.profiles where affiliate_code = candidate);
  end loop;
  return candidate;
end;
$$;

-- Backfill des lignes existantes — boucle explicite ligne par ligne
-- (chaque UPDATE dans la boucle est sa propre commande, donc chaque appel
-- suivant de generate_affiliate_code() voit bien les codes déjà attribués
-- plus tôt dans la même boucle). Un UPDATE ensembliste unique ici serait
-- risqué : rien ne garantit qu'un appel de fonction volatile pour la ligne
-- N voit l'update de la ligne N-1 au sein d'une seule commande SQL.
do $$
declare
  r record;
begin
  for r in select id from public.profiles where affiliate_code is null loop
    update public.profiles
    set affiliate_code = public.generate_affiliate_code()
    where id = r.id;
  end loop;
end $$;

alter table public.profiles alter column affiliate_code set not null;
alter table public.profiles add constraint profiles_affiliate_code_upper check (affiliate_code = upper(affiliate_code));
alter table public.profiles add constraint profiles_affiliate_code_len check (length(affiliate_code) = 8);
create unique index profiles_affiliate_code_key on public.profiles (affiliate_code);

-- Interrogée pour "combien de personnes ai-je parrainées" (via la fonction
-- get_my_affiliate_stats() de la migration suivante, jamais en lecture
-- directe côté client — cf. commentaire RLS dans 0007).
create index profiles_referred_by_idx on public.profiles (referred_by) where referred_by is not null;

-- Étend handle_new_user() : génère le code du nouvel utilisateur, résout
-- son éventuel parrain depuis raw_user_meta_data.referral_code (posé par
-- signUp({ options: { data: { referral_code } } })). Code absent/invalide
-- → referred_by reste null, le signup n'est jamais bloqué.
-- Boucle de retry sur unique_violation : generate_affiliate_code() vérifie
-- déjà l'unicité en amont, mais seule la contrainte unique en base est une
-- garantie sous concurrence (deux signups simultanés pourraient en théorie
-- passer le "not exists" avec le même candidat avant de commiter). Sans ce
-- retry, une collision — même infime — ferait échouer un vrai signup avec
-- une erreur Postgres brute.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referral_code text;
  v_referrer_id uuid;
  v_attempts int := 0;
begin
  v_referral_code := nullif(upper(trim(new.raw_user_meta_data ->> 'referral_code')), '');

  if v_referral_code is not null then
    select id into v_referrer_id
    from public.profiles
    where affiliate_code = v_referral_code;
  end if;

  loop
    begin
      insert into public.profiles (id, email, affiliate_code, referred_by)
      values (new.id, new.email, public.generate_affiliate_code(), v_referrer_id);
      exit;
    exception when unique_violation then
      v_attempts := v_attempts + 1;
      if v_attempts >= 5 then
        raise;
      end if;
    end;
  end loop;

  return new;
end;
$$;
-- Le trigger on_auth_user_created (0001_init.sql) pointe déjà sur cette
-- fonction par nom — CREATE OR REPLACE suffit, pas besoin de le recréer.

-- Aucun nouveau GRANT nécessaire : `grant select on profiles to
-- authenticated` (0001/0002) couvre déjà les nouvelles colonnes (grant au
-- niveau table, pas colonne).
