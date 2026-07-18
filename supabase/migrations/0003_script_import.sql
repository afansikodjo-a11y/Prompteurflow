-- Ajoute l'import de script (fichier .txt) comme nouveau déblocage
-- Standard/Pro, distinct des limites existantes (durée/scripts/filtres/
-- filigrane) posées dans 0001_init.sql.
alter table public.plans add column script_import boolean not null default false;

update public.plans set script_import = true where id in ('standard', 'pro');
