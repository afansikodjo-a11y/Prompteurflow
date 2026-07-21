-- Prix annuel + prix barrés (mensuel et annuel), saisis à la main par
-- l'admin — aucun calcul automatique (le niveau de remise annuelle et les
-- promos ponctuelles restent des décisions produit, pas une formule figée
-- dans le code). Tous nullable : vide = pas de prix barré affiché / pas de
-- palier annuel proposé pour ce plan (ex. Basique, gratuit).
alter table public.plans add column price_barred_xof integer;
alter table public.plans add column annual_price_xof integer;
alter table public.plans add column annual_price_barred_xof integer;

-- Aucun changement de policy/grant nécessaire : `plans` a déjà une lecture
-- publique et une écriture admin au niveau table (0001/0002), qui couvrent
-- ces nouvelles colonnes automatiquement.
