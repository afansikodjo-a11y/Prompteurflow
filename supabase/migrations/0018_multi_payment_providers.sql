-- Passage à plusieurs fournisseurs de paiement (SasPay en principal, Moneroo
-- en secours) : généralise les colonnes propres à Moneroo plutôt que de les
-- dupliquer par fournisseur — architecture qui doit rester évolutive si un
-- 3e fournisseur arrive un jour.

-- transactions/subscriptions : ajoute `provider`, backfill sur l'historique
-- (tout ce qui existe aujourd'hui vient de Moneroo, seul fournisseur en
-- place jusqu'ici), puis rend la colonne obligatoire pour toute nouvelle
-- ligne.
alter table public.transactions add column provider text check (provider in ('moneroo', 'saspay'));
update public.transactions set provider = 'moneroo' where provider is null;
alter table public.transactions alter column provider set not null;
alter table public.transactions rename column moneroo_payment_reference to payment_reference;

alter table public.subscriptions add column provider text check (provider in ('moneroo', 'saspay'));
update public.subscriptions set provider = 'moneroo' where provider is null;
alter table public.subscriptions alter column provider set not null;
alter table public.subscriptions rename column moneroo_payment_reference to payment_reference;

-- payment_events : même généralisation. La contrainte unique portait sur
-- moneroo_event_id seul (espace d'id Moneroo) ; les deux fournisseurs ayant
-- des espaces d'id indépendants, on passe à une contrainte composite
-- (provider, provider_event_id) plutôt que de risquer une collision inter-
-- fournisseurs sur une contrainte à une seule colonne.
alter table public.payment_events add column provider text check (provider in ('moneroo', 'saspay'));
update public.payment_events set provider = 'moneroo' where provider is null;
alter table public.payment_events alter column provider set not null;
alter table public.payment_events rename column moneroo_event_id to provider_event_id;
alter table public.payment_events drop constraint payment_events_moneroo_event_id_key;
alter table public.payment_events add constraint payment_events_provider_event_id_key unique (provider, provider_event_id);

-- =============================================================================
-- payment_providers
-- =============================================================================
-- Activation par fournisseur, éditable à chaud depuis /admin/paiements —
-- l'ORDRE (SasPay avant Moneroo) reste une constante de code
-- (PROVIDER_ORDER, src/app/api/checkout/lib/providers.ts), volontairement
-- pas une donnée admin : seule l'activation/désactivation a été demandée.
create table public.payment_providers (
  id text primary key check (id in ('moneroo', 'saspay')),
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

alter table public.payment_providers enable row level security;

create policy "payment_providers: lecture publique"
  on public.payment_providers for select
  using (true);

create policy "payment_providers: écriture admin uniquement"
  on public.payment_providers for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.payment_providers to anon, authenticated;
grant update on public.payment_providers to authenticated;

-- SasPay désactivé par défaut : tant qu'aucune vraie clé SASPAY_SECRET_KEY
-- n'est configurée, l'activer casserait tout checkout en prod (pas de
-- bascule automatique si l'appel API échoue — seulement si désactivé
-- manuellement, voir providers.ts). Un admin l'active lui-même une fois les
-- clés en place et un paiement de test réussi.
insert into public.payment_providers (id, enabled) values
  ('moneroo', true),
  ('saspay', false);
