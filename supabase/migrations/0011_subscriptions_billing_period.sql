-- Mémorise la période choisie au moment du checkout, pour que le webhook
-- Moneroo sache calculer current_period_end (+30 ou +365 jours) sans
-- dépendre de la fidélité avec laquelle Moneroo répercute les métadonnées
-- dans l'événement webhook (non garanti par leur documentation publique).
alter table public.subscriptions add column billing_period text check (billing_period in ('monthly', 'annual'));

-- Aucun changement de policy/grant : subscriptions reste service-role
-- uniquement en écriture, cette colonne est couverte par l'absence de
-- grant déjà en place pour toute la table.
