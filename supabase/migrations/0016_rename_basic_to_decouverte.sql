-- Bascule du modèle freemium vers deux paliers payants : le plan `basic`
-- (gratuit jusqu'ici, accessible sans même se connecter) devient "Découverte"
-- à 2500 XOF/mois. L'id reste `basic` (même logique que la rétrogradation de
-- Standard en 0015) : préserve les FK vers subscriptions/transactions
-- historiques et le check constraint `plans.id in (...)`, sans rien changer
-- aux limites du plan (durée/scripts/filigrane) — seuls le nom et le prix
-- changent. Le code applicatif (`useSubscription`) gère séparément le
-- grandfathering des comptes déjà créés, qui gardent un accès gratuit sans
-- que ça touche à cette ligne.
update public.plans
set name = 'Découverte', price_xof = 2500
where id = 'basic';
