-- Retire le plan Standard de la vente : plus aucun nouvel abonné ne doit
-- pouvoir le choisir (page tarifs publique + API checkout). La ligne reste
-- en base (jamais supprimée) : intégrité référentielle avec les lignes
-- historiques de subscriptions/transactions qui la référencent (FK
-- plan_id → plans.id, pas de cascade delete) + contrôle admin réversible
-- via /admin/plans (is_active, en place depuis 0001_init.sql mais jamais
-- lu par le code applicatif jusqu'ici).

-- Le plan Pro devient l'unique palier payant : réaffirme de façon
-- défensive qu'il reste un sur-ensemble strict de ce que Standard
-- débloquait (déjà le cas en prod au moment d'écrire ceci, mais ces
-- champs sont éditables depuis /admin/plans donc pas garantis figés).
update public.plans
set
  watermark = false,
  script_import = true,
  unlocked_filters = array['none', 'warm', 'cool', 'bw', 'cinema']
where id = 'pro';

update public.plans
set is_active = false
where id = 'standard';
