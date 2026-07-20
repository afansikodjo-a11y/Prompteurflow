import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface PlanDistributionRow {
  planId: string;
  planName: string;
  activeCount: number;
}

/**
 * Nombre d'abonnements `active` par plan, dans l'ordre de `plans` (prix
 * croissant — Basique/Standard/Pro).
 *
 * Note pour l'appelant : tant que `FEATURE_FLAGS.openAccess` (voir
 * `src/config/flags.ts`) est actif, ces chiffres ne reflètent pas de vrais
 * choix payants — tout le monde a déjà les limites Pro sans abonnement réel.
 */
export async function getPlanDistribution(): Promise<PlanDistributionRow[]> {
  const supabase = await createClient();
  const [{ data: plans }, { data: subscriptions }] = await Promise.all([
    supabase.from("plans").select("id, name").order("price_xof"),
    supabase.from("subscriptions").select("plan_id").eq("status", "active"),
  ]);

  const counts = new Map<string, number>();
  for (const row of subscriptions ?? []) {
    counts.set(row.plan_id, (counts.get(row.plan_id) ?? 0) + 1);
  }

  return (plans ?? []).map((plan) => ({
    planId: plan.id,
    planName: plan.name,
    activeCount: counts.get(plan.id) ?? 0,
  }));
}
