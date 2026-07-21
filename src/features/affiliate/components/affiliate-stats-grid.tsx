import type { AffiliateStats } from "../types";

interface AffiliateStatsGridProps {
  stats: AffiliateStats;
  commissionRatePercent: number;
}

function formatXof(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} XOF`;
}

/** Filleuls, gains en attente/versés — quatre nombres, pas de graphique nécessaire. */
export function AffiliateStatsGrid({ stats, commissionRatePercent }: AffiliateStatsGridProps) {
  const lifetimeTotal = stats.accruedTotalXof + stats.paidTotalXof;

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border bg-card p-5">
        <p className="text-muted-foreground text-sm">Filleuls</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">{stats.referredCount}</p>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <p className="text-muted-foreground text-sm">En attente de versement</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">{formatXof(stats.accruedTotalXof)}</p>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <p className="text-muted-foreground text-sm">Déjà versé</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">{formatXof(stats.paidTotalXof)}</p>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <p className="text-muted-foreground text-sm">Gagné au total</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">{formatXof(lifetimeTotal)}</p>
        <p className="text-muted-foreground mt-1 text-xs">Taux actuel : {commissionRatePercent}%</p>
      </div>
    </div>
  );
}
