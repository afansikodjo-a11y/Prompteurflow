"use client";

import * as React from "react";

import { createClient } from "@/lib/supabase/client";
import type { AdminAffiliateRow } from "../types";

export interface UseAdminAffiliateLedgerResult {
  rows: AdminAffiliateRow[];
  loading: boolean;
  markPaid: (affiliateId: string) => Promise<void>;
}

interface CommissionRow {
  affiliate_id: string;
  amount_xof: number;
  status: "accrued" | "paid" | "voided";
}

/**
 * Un affilié par ligne : filleuls, gains en attente/versés. Agrégation en
 * TypeScript plutôt qu'en SQL (même style que `getRevenueSummary()`) —
 * délibérément minimal, V1 bas volume.
 */
export function useAdminAffiliateLedger(): UseAdminAffiliateLedgerResult {
  const [rows, setRows] = React.useState<AdminAffiliateRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const supabase = createClient();

    const [{ data: referredProfiles }, { data: commissions }] = await Promise.all([
      supabase.from("profiles").select("referred_by").not("referred_by", "is", null),
      supabase.from("affiliate_commissions").select("affiliate_id, amount_xof, status"),
    ]);

    const referredCounts = new Map<string, number>();
    for (const row of referredProfiles ?? []) {
      if (!row.referred_by) continue;
      referredCounts.set(row.referred_by, (referredCounts.get(row.referred_by) ?? 0) + 1);
    }

    const totals = new Map<string, { accrued: number; paid: number }>();
    for (const row of (commissions ?? []) as CommissionRow[]) {
      const entry = totals.get(row.affiliate_id) ?? { accrued: 0, paid: 0 };
      if (row.status === "accrued") entry.accrued += row.amount_xof;
      if (row.status === "paid") entry.paid += row.amount_xof;
      totals.set(row.affiliate_id, entry);
    }

    const affiliateIds = new Set([...referredCounts.keys(), ...totals.keys()]);
    if (affiliateIds.size === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    const { data: affiliateProfiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", Array.from(affiliateIds));

    const result: AdminAffiliateRow[] = (affiliateProfiles ?? []).map((profile) => {
      const totalsEntry = totals.get(profile.id) ?? { accrued: 0, paid: 0 };
      return {
        affiliateId: profile.id,
        email: profile.email ?? "",
        referredCount: referredCounts.get(profile.id) ?? 0,
        accruedTotalXof: totalsEntry.accrued,
        paidTotalXof: totalsEntry.paid,
      };
    });

    result.sort((a, b) => b.accruedTotalXof - a.accruedTotalXof);
    setRows(result);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const markPaid = React.useCallback(
    async (affiliateId: string) => {
      const supabase = createClient();
      await supabase
        .from("affiliate_commissions")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("affiliate_id", affiliateId)
        .eq("status", "accrued");
      await refresh();
    },
    [refresh],
  );

  return { rows, loading, markPaid };
}
