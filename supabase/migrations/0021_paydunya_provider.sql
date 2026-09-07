-- Recrée `payment_providers` (supprimée en 0020) : PayDunya redevient
-- fournisseur principal, activable/désactivable depuis /admin/paiements,
-- avec Moneroo en secours. Cette fois avec une intégration PayDunya revue
-- suivant un retour d'expérience détaillé (webhook qui répond toujours 200
-- aux sondes PayDunya + re-confirmation via l'API avant tout crédit — voir
-- checkout/lib/paydunya.ts et webhooks/paydunya/route.ts).
--
-- `transactions`/`subscriptions`/`payment_events` acceptent déjà 'paydunya'
-- comme valeur de `provider` depuis la migration 0019 (jamais retiré par
-- 0020, qui n'a supprimé que cette table de configuration) : aucun
-- changement de contrainte nécessaire ici.
create table public.payment_providers (
  id text primary key check (id in ('moneroo', 'paydunya')),
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

-- PayDunya désactivé par défaut : tant qu'il n'a pas été vérifié par un
-- vrai paiement de bout en bout (webhook inclus), l'activer risquerait de
-- reproduire un problème pour un vrai client. Un admin l'active lui-même
-- une fois ce test réussi.
insert into public.payment_providers (id, enabled) values
  ('moneroo', true),
  ('paydunya', false);
