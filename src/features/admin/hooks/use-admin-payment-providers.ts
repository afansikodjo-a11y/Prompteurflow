"use client";

import * as React from "react";

import { createClient } from "@/lib/supabase/client";

export interface AdminPaymentProviderRow {
  id: "moneroo" | "paydunya";
  enabled: boolean;
}

export interface UseAdminPaymentProvidersResult {
  providers: AdminPaymentProviderRow[];
  loading: boolean;
  setEnabled: (id: AdminPaymentProviderRow["id"], enabled: boolean) => Promise<void>;
}

/** Gère l'activation des fournisseurs de paiement (PayDunya/Moneroo) pour le panneau admin. */
export function useAdminPaymentProviders(): UseAdminPaymentProvidersResult {
  const [providers, setProviders] = React.useState<AdminPaymentProviderRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("payment_providers").select("id, enabled").order("id");
    setProviders((data ?? []) as AdminPaymentProviderRow[]);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const setEnabled = React.useCallback(
    async (id: AdminPaymentProviderRow["id"], enabled: boolean) => {
      const supabase = createClient();
      await supabase.from("payment_providers").update({ enabled }).eq("id", id);
      await refresh();
    },
    [refresh],
  );

  return { providers, loading, setEnabled };
}
