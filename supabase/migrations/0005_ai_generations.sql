-- Journal d'usage de l'assistant IA d'écriture de script (Groq) — append-only,
-- même idiome que `payment_events`/`transactions`. Sert uniquement à faire
-- respecter un quota quotidien par compte (chaque appel a un coût réel,
-- contrairement au reste de l'app qui tourne 100% en local). Aucun texte de
-- prompt/résultat n'est stocké ici : pas de besoin produit identifié, et ça
-- évite d'exposer du contenu utilisateur.
create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mode text not null check (mode in ('generate', 'improve')),
  created_at timestamptz not null default now()
);

-- Seule table de ce schéma interrogée à chaque requête (chemin chaud : le
-- quota se vérifie à chaque appel IA) — contrairement aux autres tables qui
-- ne s'appuient que sur la clé primaire, un index explicite est justifié ici.
create index ai_generations_user_id_created_at_idx
  on public.ai_generations (user_id, created_at desc);

alter table public.ai_generations enable row level security;

-- Lecture nécessaire au calcul du quota lui-même : la route API interroge
-- cette table sous la session de l'utilisateur (pas en service-role), donc
-- la RLS sert aussi de garde-fou en profondeur si jamais le WHERE côté
-- application avait un bug.
create policy "ai_generations: lecture de ses propres lignes"
  on public.ai_generations for select
  using (auth.uid() = user_id);

create policy "ai_generations: écriture de ses propres lignes"
  on public.ai_generations for insert
  with check (auth.uid() = user_id);

-- Aucun grant à `anon` : cette fonctionnalité exige un compte connecté,
-- l'accès anonyme doit être structurellement impossible, pas juste masqué
-- côté UI. Rappel de la leçon 0002_grants.sql : une policy RLS seule ne
-- suffit pas, il faut aussi le GRANT de base.
grant select, insert on public.ai_generations to authenticated;

-- Pas de policy update/delete : journal immuable, comme `payment_events`/`transactions`.
