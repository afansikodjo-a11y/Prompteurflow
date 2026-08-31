"use client";

import * as React from "react";

import { useAuth } from "@/features/auth";
import { FEATURE_FLAGS } from "@/config/flags";
import { createClient } from "@/lib/supabase/client";
import { BASIC_PLAN_ID, FAIL_CLOSED_PLAN, GRANDFATHER_CUTOFF, PRO_PLAN_ID } from "../constants";
import { getPlan } from "../lib/plans-db";
import type { Plan, PlanId } from "../types";

export interface UseSubscriptionResult {
  /** `true` uniquement sur le palier Pro (au-dessus de Découverte — cloud/sous-titres). */
  isPro: boolean;
  /** Plan courant (repli fail-closed tant que non résolu). */
  plan: Plan;
  /**
   * `true` si l'utilisateur a le droit d'utiliser le studio : abonnement
   * actif, admin, ou compte grandfathered (créé avant `GRANDFATHER_CUTOFF`,
   * garde l'accès gratuit historique). `false` sinon — plus de palier
   * gratuit pour les nouveaux comptes/visiteurs anonymes.
   */
  hasAccess: boolean;
  /** `true` tant que le statut d'abonnement n'est pas encore connu. */
  loading: boolean;
}

interface SubscriptionRow {
  plan_id: PlanId;
  current_period_end: string | null;
}

/**
 * Résout le plan courant de l'utilisateur, et s'il a le droit d'utiliser le
 * studio (`hasAccess`).
 *
 * Abonnement `active` non expiré → ce plan, accès accordé. Sinon, accès
 * accordé uniquement si le compte est grandfathered (créé avant
 * `GRANDFATHER_CUTOFF` — garde l'accès gratuit qu'il avait du temps du plan
 * Basique) ; refusé pour un visiteur anonyme ou un compte créé après la
 * coupure, qui doit payer Découverte ou Pro. Repli « fail-closed » si la
 * lecture échoue — jamais un déblocage silencieux de Pro.
 *
 * Exception temporaire : `FEATURE_FLAGS.openAccess` (phase de test, signup/
 * tarifs coupés) donne à tout le monde les limites du plan Pro et l'accès,
 * connecté ou non.
 *
 * Exception permanente : un compte admin (`profiles.role`) a toujours les
 * limites du plan Pro et l'accès, sans abonnement réel — un admin gère
 * l'app, il n'a pas à se payer lui-même pour l'utiliser.
 */
export function useSubscription(): UseSubscriptionResult {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = React.useState<Plan>(FAIL_CLOSED_PLAN);
  const [isPro, setIsPro] = React.useState(false);
  const [hasAccess, setHasAccess] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function resolve() {
      const isAdmin = user?.role === "admin";

      if (FEATURE_FLAGS.openAccess || isAdmin) {
        const resolvedPlan = await getPlan(PRO_PLAN_ID);
        if (cancelled) return;
        setPlan(resolvedPlan ?? FAIL_CLOSED_PLAN);
        setIsPro(Boolean(resolvedPlan));
        setHasAccess(true);
        setLoading(false);
        return;
      }

      let planId: PlanId | null = null;

      if (user) {
        const supabase = createClient();
        const { data } = await supabase
          .from("subscriptions")
          .select("plan_id, current_period_end")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle<SubscriptionRow>();

        // `status = 'active'` seul ne suffit pas : un abonnement dont la
        // période payée est passée doit retomber sur le grandfathering (ou
        // aucun accès), pas rester actif indéfiniment faute d'un job de
        // renouvellement/expiration (Moneroo ne débite pas automatiquement —
        // voir le chantier checkout/webhook).
        const stillWithinPeriod = !data?.current_period_end || new Date(data.current_period_end) > new Date();
        if (data && stillWithinPeriod) planId = data.plan_id;
      }

      const isGrandfathered = Boolean(user) && new Date(user!.createdAt) < new Date(GRANDFATHER_CUTOFF);
      const resolvedHasAccess = planId !== null || isGrandfathered;
      if (planId === null && isGrandfathered) planId = BASIC_PLAN_ID;

      const resolvedPlan = planId ? await getPlan(planId) : null;
      if (cancelled) return;
      setPlan(resolvedPlan ?? FAIL_CLOSED_PLAN);
      setIsPro(Boolean(resolvedPlan) && planId === PRO_PLAN_ID);
      setHasAccess(resolvedHasAccess);
      setLoading(false);
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isPro, plan, hasAccess, loading };
}
