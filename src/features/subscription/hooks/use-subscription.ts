"use client";

import * as React from "react";

import { useAuth } from "@/features/auth";
import { FEATURE_FLAGS } from "@/config/flags";
import { createClient } from "@/lib/supabase/client";
import { BASIC_PLAN_ID, FAIL_CLOSED_PLAN, PRO_PLAN_ID } from "../constants";
import { getPlan } from "../lib/plans-db";
import type { Plan, PlanId } from "../types";

export interface UseSubscriptionResult {
  /** `true` uniquement sur le palier Pro (au-dessus de Standard — cloud/sous-titres). */
  isPro: boolean;
  /** Plan courant (Basique par défaut/repli). */
  plan: Plan;
  /** `true` tant que le statut d'abonnement n'est pas encore connu. */
  loading: boolean;
}

interface SubscriptionRow {
  plan_id: PlanId;
}

/**
 * Résout le plan courant de l'utilisateur.
 *
 * Anonyme ou sans abonnement `active` → plan Basique, relu en direct depuis
 * `plans` (ses limites restent éditables par l'admin). Repli « fail-closed »
 * si la lecture échoue — jamais un déblocage silencieux de Standard/Pro.
 *
 * Exception temporaire : `FEATURE_FLAGS.openAccess` (phase de test, signup/
 * tarifs coupés) donne à tout le monde les limites du plan Pro, connecté ou
 * non — sans ça, un testeur Basique buterait sur une limite sans aucun
 * moyen de payer, ni même de créer un compte, pour la lever.
 */
export function useSubscription(): UseSubscriptionResult {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = React.useState<Plan>(FAIL_CLOSED_PLAN);
  const [isPro, setIsPro] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function resolve() {
      let planId: PlanId = FEATURE_FLAGS.openAccess ? PRO_PLAN_ID : BASIC_PLAN_ID;

      if (!FEATURE_FLAGS.openAccess && user) {
        const supabase = createClient();
        const { data } = await supabase
          .from("subscriptions")
          .select("plan_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle<SubscriptionRow>();
        if (data) planId = data.plan_id;
      }

      const resolvedPlan = await getPlan(planId);
      if (cancelled) return;
      setPlan(resolvedPlan ?? FAIL_CLOSED_PLAN);
      setIsPro(Boolean(resolvedPlan) && planId === PRO_PLAN_ID);
      setLoading(false);
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isPro, plan, loading };
}
