-- Programme d'affiliation (2/2) : taux global + registre des commissions +
-- calcul automatique. Reste vide/inerte tant que `transactions` reste vide
-- (checkout/webhook Moneroo non construits) — logique déjà prête pour
-- s'activer automatiquement, même philosophie que `revenue-metrics.ts`.

-- =============================================================================
-- affiliate_settings
-- =============================================================================
-- Délibérément PAS un `app_settings` générique : la RLS est par ligne, pas
-- par colonne — un futur réglage admin-only posé dans la même ligne
-- hériterait de la policy "lecture publique" ci-dessous. Un nom de table
-- scopé au périmètre exact de visibilité évite ce piège plus tard.
create table public.affiliate_settings (
  id boolean primary key default true,
  commission_rate_percent numeric(5, 2) not null default 20.00
    check (commission_rate_percent >= 0 and commission_rate_percent <= 100),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),
  constraint affiliate_settings_singleton check (id)
);

insert into public.affiliate_settings (id) values (true);

alter table public.affiliate_settings enable row level security;

create policy "affiliate_settings: lecture publique"
  on public.affiliate_settings for select
  using (true);

create policy "affiliate_settings: écriture admin uniquement"
  on public.affiliate_settings for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.affiliate_settings to anon, authenticated;
-- Volontairement pas de grant insert/delete (contrairement à `plans`) :
-- singleton vrai (contrainte `id boolean` + check), une seule ligne existe
-- et existera toujours ; un delete accidentel casserait la lecture du taux
-- pour tout le monde sans aucun bénéfice produit à autoriser insert/delete.
grant update on public.affiliate_settings to authenticated;

-- =============================================================================
-- affiliate_commissions
-- =============================================================================
create table public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.profiles (id),
  referred_user_id uuid not null references public.profiles (id),
  transaction_id uuid not null unique references public.transactions (id),
  amount_xof integer not null,
  rate_applied numeric(5, 2) not null check (rate_applied >= 0 and rate_applied <= 100),
  status text not null default 'accrued' check (status in ('accrued', 'paid', 'voided')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index affiliate_commissions_affiliate_status_idx
  on public.affiliate_commissions (affiliate_id, status);

alter table public.affiliate_commissions enable row level security;

create policy "affiliate_commissions: lecture admin uniquement"
  on public.affiliate_commissions for select
  using (public.is_admin());

create policy "affiliate_commissions: marquage payé par un admin uniquement"
  on public.affiliate_commissions for update
  using (public.is_admin())
  with check (public.is_admin());

grant select, update on public.affiliate_commissions to authenticated;
-- Aucun grant insert/delete : les lignes sont créées exclusivement par le
-- trigger security definer ci-dessous (tourne avec les privilèges du
-- propriétaire de la fonction, pas soumis aux GRANT du rôle `authenticated`)
-- — jamais par un client, même admin.

-- =============================================================================
-- Calcul automatique — succès
-- =============================================================================
create function public.compute_affiliate_commission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer_id uuid;
  v_rate numeric(5, 2);
begin
  if new.status <> 'succeeded' or new.user_id is null then
    return new;
  end if;

  select referred_by into v_referrer_id from public.profiles where id = new.user_id;
  if v_referrer_id is null then
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

create trigger on_transaction_succeeded_compute_commission
  after insert or update of status on public.transactions
  for each row
  when (new.status = 'succeeded')
  execute procedure public.compute_affiliate_commission();

-- =============================================================================
-- Annulation — remboursement (garde-fou minimal, pas une réconciliation
-- complète : si la commission est déjà `paid` au moment du remboursement,
-- elle n'est PAS touchée — cas hors périmètre, résolution manuelle admin)
-- =============================================================================
create function public.void_affiliate_commission_on_refund()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.affiliate_commissions
  set status = 'voided'
  where transaction_id = new.id and status = 'accrued';
  return new;
end;
$$;

create trigger on_transaction_refunded_void_commission
  after update of status on public.transactions
  for each row
  when (new.status = 'refunded' and old.status = 'succeeded')
  execute procedure public.void_affiliate_commission_on_refund();

-- =============================================================================
-- Stats agrégées de l'affilié courant — nécessaire car la policy RLS de
-- `profiles` (select own row or admin) empêche structurellement un
-- utilisateur de lire les lignes des gens qu'il a parrainés (referred_by =
-- auth.uid() AND id = auth.uid() ne peut jamais être vrai pour une ligne
-- d'un tiers). Une nouvelle policy SELECT ouverte sur `referred_by =
-- auth.uid()` exposerait l'email complet de chaque filleul au parrain — pas
-- souhaitable. Fonction security definer, même idiome que is_admin() :
-- ne renvoie que des agrégats pour l'appelant, jamais de lignes brutes.
-- =============================================================================
create function public.get_my_affiliate_stats()
returns table (referred_count bigint, accrued_total_xof bigint, paid_total_xof bigint)
language sql
security definer
stable
set search_path = public
as $$
  select
    (select count(*) from public.profiles where referred_by = auth.uid()),
    (select coalesce(sum(amount_xof), 0) from public.affiliate_commissions where affiliate_id = auth.uid() and status = 'accrued'),
    (select coalesce(sum(amount_xof), 0) from public.affiliate_commissions where affiliate_id = auth.uid() and status = 'paid');
$$;

grant execute on function public.get_my_affiliate_stats() to authenticated;
