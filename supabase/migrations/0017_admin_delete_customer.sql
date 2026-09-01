-- Nettoyage des lignes dépendantes avant suppression réelle d'un compte
-- client désactivé (voir /api/admin/customers/delete). Ne touche jamais
-- auth.users/profiles elle-même : la suppression du compte passe par l'API
-- Admin Supabase Auth (auth.admin.deleteUser), qui cascade déjà vers
-- profiles (on delete cascade, 0001_init.sql) puis ai_generations (idem,
-- 0005_ai_generations.sql). Cette fonction couvre uniquement les FK sans
-- cascade qui bloqueraient sinon cette cascade avec une erreur Postgres
-- brute : transactions/subscriptions/affiliate_commissions (identité du
-- client), plus les colonnes updated_by/referred_by qui peuvent encore
-- pointer vers lui depuis d'autres lignes.
--
-- Choix produit assumé (demande explicite, pas le comportement par défaut
-- de la désactivation) : suppression complète, y compris l'historique de
-- paiement et de commissions d'affiliation de ce client — pas une
-- anonymisation. Si ce client a lui-même généré une commission pour un
-- parrain (affiliate_id ou referred_user_id = lui), cette commission est
-- perdue aussi.
create or replace function public.admin_delete_customer_dependents(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.transactions where user_id = target_id;
  delete from public.subscriptions where user_id = target_id;
  delete from public.affiliate_commissions
    where affiliate_id = target_id or referred_user_id = target_id;
  update public.affiliate_settings set updated_by = null where updated_by = target_id;
  update public.plans set updated_by = null where updated_by = target_id;
  update public.profiles set referred_by = null where referred_by = target_id;
end;
$$;

-- Aucun grant à `anon`/`authenticated` (contrairement à `get_my_affiliate_stats`,
-- 0007) : appelée uniquement via le client service-role depuis la route API,
-- qui a déjà vérifié que l'appelant est admin — jamais un appel RPC direct
-- depuis le navigateur, même pour un admin.
