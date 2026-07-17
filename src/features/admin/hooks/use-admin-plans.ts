"use client";

import * as React from "react";

import { getAllPlans, updatePlan, type Plan, type PlanId } from "@/features/subscription";

export interface UseAdminPlansResult {
  plans: Plan[];
  loading: boolean;
  update: (id: PlanId, patch: Partial<Plan>) => Promise<void>;
  refresh: () => Promise<void>;
}

/** Gère les plans tarifaires (Basique/Standard/Pro) pour le panneau admin. */
export function useAdminPlans(): UseAdminPlansResult {
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      setPlans(await getAllPlans());
    } catch {
      // Stockage indisponible : on garde la liste vide.
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const update = React.useCallback(
    async (id: PlanId, patch: Partial<Plan>) => {
      await updatePlan(id, patch);
      await refresh();
    },
    [refresh],
  );

  return { plans, loading, update, refresh };
}
