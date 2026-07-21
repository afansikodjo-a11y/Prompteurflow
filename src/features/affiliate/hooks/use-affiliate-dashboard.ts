"use client";

import * as React from "react";

import { buildReferralLink, getCommissionRate, getMyAffiliateCode, getMyAffiliateStats } from "../lib/affiliate-db";
import type { AffiliateStats } from "../types";

export interface UseAffiliateDashboardResult {
  loading: boolean;
  referralLink: string | null;
  stats: AffiliateStats;
  commissionRatePercent: number;
}

/**
 * Charge le lien de parrainage, les stats et le taux courant de
 * l'utilisateur connecté. Pas de dépendance à `useAuth()`/`@/features/auth`
 * ici — la page appelante est déjà gardée côté serveur, et le client
 * Supabase navigateur porte déjà la session via les cookies (voir le plan :
 * éviter un cycle d'import entre les barrels `auth` et `affiliate`).
 */
export function useAffiliateDashboard(): UseAffiliateDashboardResult {
  const [loading, setLoading] = React.useState(true);
  const [referralLink, setReferralLink] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<AffiliateStats>({
    referredCount: 0,
    accruedTotalXof: 0,
    paidTotalXof: 0,
  });
  const [commissionRatePercent, setCommissionRatePercent] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      const [code, statsResult, rate] = await Promise.all([
        getMyAffiliateCode(),
        getMyAffiliateStats(),
        getCommissionRate(),
      ]);
      if (cancelled) return;
      setReferralLink(code ? buildReferralLink(code) : null);
      setStats(statsResult);
      setCommissionRatePercent(rate);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, referralLink, stats, commissionRatePercent };
}
