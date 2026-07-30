"use client";

import { Button } from "@/components/ui/button";
import { formatXof } from "../lib/format-price";
import type { BillingPeriod, Plan } from "../types";

interface AnnualSavingsChoiceProps {
  /** Plan concerné — ignoré (rend `null`) si aucune formule annuelle n'existe pour lui. */
  plan: Plan;
  /** Période dont le paiement est en cours, pour n'afficher "Redirection…" que sur le bon bouton. */
  pendingPeriod: BillingPeriod | null;
  onChoose: (period: BillingPeriod) => void;
}

/**
 * Message d'économie + choix mensuel/annuel — bloc réutilisable posé au
 * moment où quelqu'un s'apprête à payer au mois alors qu'une formule
 * annuelle moins chère existe. Jamais imposé : "Continuer en mensuel" reste
 * toujours disponible à côté.
 */
export function AnnualSavingsChoice({ plan, pendingPeriod, onChoose }: AnnualSavingsChoiceProps) {
  if (plan.annualPriceXof === null) return null;

  const monthlyTotal = plan.priceXof * 12;
  const savings = monthlyTotal - plan.annualPriceXof;
  const savingsPercent = monthlyTotal > 0 ? Math.round((savings / monthlyTotal) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">
        Économisez {savingsPercent}&nbsp;% en payant à l&apos;année : {formatXof(plan.annualPriceXof)} / an au lieu
        de {formatXof(monthlyTotal)} en mensuel — soit {formatXof(savings)} d&apos;économie.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={pendingPeriod !== null} onClick={() => onChoose("monthly")}>
          {pendingPeriod === "monthly" ? "Redirection…" : "Continuer en mensuel"}
        </Button>
        <Button type="button" disabled={pendingPeriod !== null} onClick={() => onChoose("annual")}>
          {pendingPeriod === "annual" ? "Redirection…" : "Profiter de l'offre annuelle"}
        </Button>
      </div>
    </div>
  );
}
