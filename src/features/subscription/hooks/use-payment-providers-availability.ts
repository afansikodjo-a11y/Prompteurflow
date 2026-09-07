"use client";

import * as React from "react";

import { createClient } from "@/lib/supabase/client";

/**
 * Lecture publique de `payment_providers` (RLS déjà ouverte, comme `plans`)
 * — sert à `PricingCards` pour savoir si le formulaire SoftPay (PayDunya
 * uniquement) doit être proposé, ou si on retombe sur la redirection
 * classique (ex. PayDunya désactivé, Moneroo seul actif).
 */
export function usePaymentProvidersAvailability(): { paydunyaEnabled: boolean; loading: boolean } {
  const [paydunyaEnabled, setPaydunyaEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("payment_providers").select("id, enabled").eq("id", "paydunya").maybeSingle();
      if (cancelled) return;
      setPaydunyaEnabled(data?.enabled ?? false);
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { paydunyaEnabled, loading };
}
