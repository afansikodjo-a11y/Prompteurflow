import type { PlanDistributionRow } from "../lib/subscription-metrics";

// Slots 1/2/3 du thème catégoriel (bleu/vert/magenta) de la skill dataviz —
// ordre fixe, valeurs dark-mode déjà validées CVD/contraste dans
// `references/palette.md`, pas choisies à l'oeil.
const CATEGORY_COLORS = ["#3987e5", "#008300", "#d55181"];

interface PlanDistributionChartProps {
  rows: PlanDistributionRow[];
}

/**
 * Une ligne par plan — nom + barre + total, chacun directement étiqueté :
 * pas de légende nécessaire (voir `marks-and-anatomy.md`, une identité par
 * étiquette directe n'a pas besoin du canal couleur seul).
 */
export function PlanDistributionChart({ rows }: PlanDistributionChartProps) {
  const max = Math.max(1, ...rows.map((row) => row.activeCount));

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div key={row.planId} className="flex items-center gap-3">
          <span className="text-muted-foreground w-20 shrink-0 text-sm">{row.planName}</span>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-[width]"
              style={{
                width: `${(row.activeCount / max) * 100}%`,
                backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
              }}
              title={`${row.planName} — ${row.activeCount} abonnement${row.activeCount > 1 ? "s" : ""} actif${row.activeCount > 1 ? "s" : ""}`}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-sm tabular-nums">{row.activeCount}</span>
        </div>
      ))}
    </div>
  );
}
