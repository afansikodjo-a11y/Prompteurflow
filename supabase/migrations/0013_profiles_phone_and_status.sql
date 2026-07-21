-- Détails client pour le panneau admin : téléphone (pour relancer via
-- WhatsApp — aucun numéro n'est collecté à l'inscription aujourd'hui,
-- rempli à la main par un admin) et statut de désactivation.
alter table public.profiles add column phone text;
alter table public.profiles add column disabled_at timestamptz;

-- Autorise l'admin à éditer le téléphone, même geste que is_affiliate
-- (0008) : la policy RLS admin-only existe déjà sur profiles, seul le
-- GRANT par colonne manquait pour celle-ci.
grant update (phone) on public.profiles to authenticated;

-- Pas de grant authenticated pour disabled_at : posé exclusivement par la
-- route /api/admin/customers/status via le client service-role, en même
-- temps que le vrai bannissement côté Supabase Auth
-- (auth.admin.updateUserById) — jamais éditable séparément, pour ne pas
-- laisser un compte "à moitié" désactivé (statut affiché sans que la
-- connexion soit vraiment bloquée, ou l'inverse).
