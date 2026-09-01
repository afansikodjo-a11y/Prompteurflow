-- Remplace SasPay par PayDunya comme fournisseur principal. SasPay a eu
-- plusieurs paiements confirmés côté SasPay (statut PAID) mais dont le
-- webhook n'a jamais été livré correctement — vérifié en profondeur
-- (URL, secret, code du webhook tous fonctionnels côté nous, testé par un
-- appel signé manuellement accepté en 200), le souci reste chez eux.
-- Abandonné après 3 occurrences.
--
-- Les lignes historiques provider='saspay' (transactions/subscriptions/
-- payment_events, dont les 2 abonnements reconciliés manuellement)
-- restent lisibles : les contraintes check() gardent 'saspay' comme valeur
-- valide, seulement plus utilisée pour du nouveau trafic (retiré de
-- PROVIDER_ORDER, checkout/lib/providers.ts).
alter table public.transactions drop constraint transactions_provider_check;
alter table public.transactions add constraint transactions_provider_check check (provider in ('moneroo', 'saspay', 'paydunya'));

alter table public.subscriptions drop constraint subscriptions_provider_check;
alter table public.subscriptions add constraint subscriptions_provider_check check (provider in ('moneroo', 'saspay', 'paydunya'));

alter table public.payment_events drop constraint payment_events_provider_check;
alter table public.payment_events add constraint payment_events_provider_check check (provider in ('moneroo', 'saspay', 'paydunya'));

-- payment_providers est une config d'admin, pas un journal historique —
-- contrairement aux tables ci-dessus, la ligne 'saspay' est bien supprimée
-- (rien ne doit plus jamais pouvoir la réactiver par erreur depuis
-- /admin/paiements). Supprimée AVANT de resserrer la contrainte : dans
-- l'autre ordre, Postgres valide la nouvelle contrainte contre les lignes
-- encore présentes et rejette la ligne 'saspay' pas encore effacée.
delete from public.payment_providers where id = 'saspay';

alter table public.payment_providers drop constraint payment_providers_id_check;
alter table public.payment_providers add constraint payment_providers_id_check check (id in ('moneroo', 'paydunya'));

-- Désactivé par défaut, même raisonnement que SasPay à l'époque : tant que
-- le format exact de l'IPN (webhook) n'a pas été vérifié par un vrai appel,
-- l'activer risquerait de reproduire le même problème pour un vrai client.
insert into public.payment_providers (id, enabled) values ('paydunya', false);
