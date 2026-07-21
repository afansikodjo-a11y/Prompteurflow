"use client";

import * as React from "react";

import { createClient } from "@/lib/supabase/client";

export interface UseAdminAffiliateSettingsResult {
  ratePercent: number;
  loading: boolean;
  update: (ratePercent: number) => Promise<void>;
}

/** Taux de commission global du programme d'affiliation (admin uniquement — appliqué via RLS). */
export function useAdminAffiliateSettings(): UseAdminAffiliateSettingsResult {
  const [ratePercent, setRatePercent] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("affiliate_settings")
      .select("commission_rate_percent")
      .eq("id", true)
      .single();
    setRatePercent(data?.commission_rate_percent ?? 0);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const update = React.useCallback(
    async (value: number) => {
      const supabase = createClient();
      await supabase.from("affiliate_settings").update({ commission_rate_percent: value }).eq("id", true);
      await refresh();
    },
    [refresh],
  );

  return { ratePercent, loading, update };
}
