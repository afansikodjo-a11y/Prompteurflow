-- Complète 0001_init.sql : les policies RLS ne suffisent pas seules, Postgres
-- exige aussi les GRANT de base sur chaque table (une policy `using (true)`
-- n'a aucun effet tant que le rôle n'a pas le droit de faire un SELECT/INSERT/
-- UPDATE/DELETE en premier lieu). Absence constatée en prod : lecture de
-- `plans` refusée avec "permission denied for table plans" (42501) malgré la
-- policy de lecture publique déjà en place.

-- plans : lecture publique (page de prix, y compris anonyme) ; écriture
-- ouverte à `authenticated`, restreinte aux admins par la policy RLS.
grant select on public.plans to anon, authenticated;
grant insert, update, delete on public.plans to authenticated;

-- profiles : lecture par soi-même ou un admin (RLS) ; aucune écriture client
-- (voir le commentaire dans 0001_init.sql sur `role`).
grant select on public.profiles to authenticated;

-- subscriptions : lecture par le propriétaire ou un admin (RLS) ; aucune
-- écriture client, seul le service-role (checkout/webhook) écrit ici.
grant select on public.subscriptions to authenticated;

-- payment_events : aucun grant — accès service-role uniquement (déjà correct,
-- rappelé ici pour la lisibilité du schéma).
