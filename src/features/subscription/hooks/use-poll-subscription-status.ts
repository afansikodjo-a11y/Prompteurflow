"use client";

import * as React from "react";

import { createClient } from "@/lib/supabase/client";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10; // ~30s

export type PollSubscriptionStatus = "checking" | "active" | "failed" | "timeout";

/**
 * Interroge `subscriptions.status` jusqu'à activation (webhook traité),
 * annulation explicite, ou expiration du délai d'observation — jamais la
 * source de vérité elle-même (le webhook l'est), juste un retour rassurant
 * pendant que ce dernier arrive. Partagé entre la page de retour (checkout
 * hébergé) et le dialogue SoftPay (paiement sur place).
 */
export function usePollSubscriptionStatus(enabled: boolean): PollSubscriptionStatus {
  const [status, setStatus] = React.useState<PollSubscriptionStatus>("checking");

  React.useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        if (!cancelled) setStatus("timeout");
        return;
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (data?.status === "active") {
        setStatus("active");
        return;
      }
      if (data?.status === "canceled") {
        setStatus("failed");
        return;
      }

      attempts += 1;
      if (attempts >= MAX_POLLS) {
        setStatus("timeout");
        return;
      }
      setTimeout(() => void poll(), POLL_INTERVAL_MS);
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return status;
}
