-- PrompteurFlow — schéma initial : profils/rôle admin, plans tarifaires
-- (Basique/Standard/Pro, éditables sans déploiement), abonnements, journal
-- des webhooks de paiement (Moneroo).
--
-- Pas encore exécutable : en attente du projet Supabase (Phase 1). À lancer
-- une fois depuis l'éditeur SQL du projet, ou via `supabase db push`.

create extension if not exists pgcrypto;

-- =============================================================================
-- profiles
-- =============================================================================
-- Un profil par utilisateur (`auth.users`), peuplé automatiquement à
-- l'inscription. Volontairement AUCUNE policy d'update/insert client, même
-- pas restreinte par colonne : rien dans l'app n'a besoin qu'un utilisateur
-- modifie son propre profil aujourd'hui. Le point le plus sensible du
-- schéma est ici — un update client sur `role`, même partiel, permettrait à
-- n'importe quel utilisateur de s'auto-promouvoir admin via le SDK JS.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- =============================================================================
-- is_admin() — définie avant les policies qui en dépendent (profiles, plans)
-- =============================================================================
create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles: lecture de son propre profil ou par un admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Peuple `profiles` à la création d'un compte `auth.users` — jamais via un
-- insert client.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- plans
-- =============================================================================
-- Prix (XOF, entier — pas de sous-unité) et limites par plan, édités à chaud
-- depuis le panneau admin. Lisible par tous (page de prix publique, y
-- compris anonyme) ; écriture réservée aux admins.
create table public.plans (
  id text primary key check (id in ('basic', 'standard', 'pro')),
  name text not null,
  price_xof integer not null default 0,
  max_duration_sec integer,
  max_scripts integer,
  watermark boolean not null default false,
  unlocked_filters text[] not null default array['none'],
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

alter table public.plans enable row level security;

create policy "plans: lecture publique"
  on public.plans for select
  using (true);

create policy "plans: écriture admin uniquement"
  on public.plans for all
  using (public.is_admin())
  with check (public.is_admin());

-- Standard et Pro partagent aujourd'hui les mêmes limites (tout débloqué) —
-- Pro se distinguera par le stockage cloud temporaire + les sous-titres
-- synchronisés, ajoutés dans une migration ultérieure une fois ce chantier
-- conçu. Les prix ci-dessous ne sont que des valeurs de départ, éditables
-- immédiatement depuis le panneau admin.
insert into public.plans (id, name, price_xof, max_duration_sec, max_scripts, watermark, unlocked_filters)
values
  ('basic', 'Basique', 0, 120, 3, true, array['none']),
  ('standard', 'Standard', 5000, null, null, false, array['none', 'warm', 'cool', 'bw', 'cinema']),
  ('pro', 'Pro', 10000, null, null, false, array['none', 'warm', 'cool', 'bw', 'cinema']);

-- =============================================================================
-- subscriptions
-- =============================================================================
-- Aucune ligne `active` pour un utilisateur = plan Basique implicite (relu
-- en direct depuis `plans`, jamais dupliqué ici). Écriture réservée au
-- client service-role (checkout + webhook) — aucune policy pour
-- `authenticated`/`anon`, lecture par le propriétaire ou un admin seulement.
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  plan_id text not null references public.plans (id),
  status text not null check (status in ('pending', 'active', 'canceled', 'past_due')),
  moneroo_payment_reference text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions: lecture par le propriétaire ou un admin"
  on public.subscriptions for select
  using (auth.uid() = user_id or public.is_admin());

-- =============================================================================
-- payment_events
-- =============================================================================
-- Journal des webhooks Moneroo — dédoublonnage via la contrainte unique sur
-- `moneroo_event_id`. Aucune policy : accès service-role uniquement.
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  moneroo_event_id text not null unique,
  event_type text,
  payload jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.payment_events enable row level security;
