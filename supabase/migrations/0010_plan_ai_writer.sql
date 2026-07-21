-- Réserve l'assistant IA d'écriture de script au plan Pro — même schéma que
-- `script_import` (0003_script_import.sql) : un booléen éditable à chaud
-- depuis /admin/plans, pas une valeur figée dans le code.
alter table public.plans add column ai_writer boolean not null default false;

update public.plans set ai_writer = true where id = 'pro';
