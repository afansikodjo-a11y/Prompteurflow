"use client";

import { useAffiliateDashboard } from "../hooks/use-affiliate-dashboard";
import { AffiliateLinkCard } from "./affiliate-link-card";
import { AffiliateStatsGrid } from "./affiliate-stats-grid";

/** Compose lien + stats — lecture côté client, la session est déjà garantie par la page serveur appelante. */
export function AffiliateDashboard() {
  const { loading, referralLink, stats, commissionRatePercent } = useAffiliateDashboard();

  if (loading) return <p className="text-muted-foreground text-sm">Chargement…</p>;

  return (
    <>
      {referralLink && <AffiliateLinkCard link={referralLink} />}
      <AffiliateStatsGrid stats={stats} commissionRatePercent={commissionRatePercent} />
    </>
  );
}
