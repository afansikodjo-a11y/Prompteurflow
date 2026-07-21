"use client";

import * as React from "react";

import { useAuth } from "@/features/auth";
import { createClient } from "@/lib/supabase/client";
import { BASIC_PLAN_ID } from "../constants";
import { getPlan } from "../lib/plans-db";
import type { Plan, PlanId } from "../types";

export type MySubscriptionStatus = "none" | "pending" | "active" | "canceled" | "past_due";

export interface MySubscriptionDetails {
  loading: boolean;
  plan: Plan | null;
  status: MySubscriptionStatus;
  billingPeriod: "monthly" | "annual" | null;
  currentPeriodEnd: string | null;
}

interface SubscriptionRow {
  plan_id: PlanId;
  status: string;
  billing_period: string | null;
  current_period_end: string | null;
}

/**
 * État réel du dernier abonnement de l'utilisateur connecté — délibérément
 * indépendant de `FEATURE_FLAGS.openAccess` (qui ne concerne que les
 * limites appliquées en pratique pendant la phase de test, pas ce que
 * l'utilisateur a réellement souscrit/payé). Utilisé par la page
 * Paramètres pour afficher un statut honnête, jamais par le Studio pour
 * débloquer des fonctionnalités (voir `useSubscription`).
 */
export function useMySubscriptionDetails(): MySubscriptionDetails {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = React.useState<Plan | null>(null);
  const [status, setStatus] = React.useState<MySubscriptionStatus>("none");
  const [billingPeriod, setBillingPeriod] = React.useState<"monthly" | "annual" | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function resolve() {
      if (!user) {
        if (!cancelled) {
          setPlan(await getPlan(BASIC_PLAN_ID));
          setLoading(false);
        }
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from("subscriptions")
        .select("plan_id, status, billing_period, current_period_end")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<SubscriptionRow>();

      if (cancelled) return;

      if (!data) {
        setPlan(await getPlan(BASIC_PLAN_ID));
        setStatus("none");
        setBillingPeriod(null);
        setCurrentPeriodEnd(null);
      } else {
        setPlan(await getPlan(data.plan_id));
        setStatus(data.status as MySubscriptionStatus);
        setBillingPeriod(data.billing_period as "monthly" | "annual" | null);
        setCurrentPeriodEnd(data.current_period_end);
      }
      setLoading(false);
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { loading, plan, status, billingPeriod, currentPeriodEnd };
}
