-- Sur un projet Supabase standard, `service_role` a un accès complet à
-- tout le schéma public par défaut (en plus de contourner la RLS) — c'est
-- toute sa raison d'être : le seul rôle utilisé côté serveur pour les
-- opérations qui doivent ignorer RLS et les GRANT applicatifs habituels
-- (checkout et webhook Moneroo, notamment). Constaté manquant sur ce
-- projet : "permission denied" testé directement sur profiles,
-- transactions et plans avec la vraie clé service-role. Cette migration
-- restaure l'état normalement attendu, rien de plus.
--
-- Aucun impact sur anon/authenticated : leurs GRANT et policies RLS
-- existants restent inchangés, seul service_role est concerné ici.
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all functions in schema public to service_role;

-- Pour que les tables/fonctions créées par de futures migrations héritent
-- aussi automatiquement de ces privilèges, sans y repenser à chaque fois.
alter default privileges in schema public grant all privileges on tables to service_role;
alter default privileges in schema public grant all privileges on sequences to service_role;
alter default privileges in schema public grant all privileges on functions to service_role;
