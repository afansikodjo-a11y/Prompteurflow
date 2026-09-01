import type { Plan } from "../types";

/**
 * Pourcentage économisé en payant à l'année plutôt qu'au mois (prix annuel
 * vs prix mensuel × 12) — `null` si le plan n'a pas de palier annuel. Seule
 * source de vérité pour ce calcul, partagée entre la carte tarifs et la
 * modale d'upsell annuel : jamais deux formules qui pourraient diverger.
 */
export function annualSavingsPercent(plan: Plan): number | null {
  if (plan.annualPriceXof === null) return null;
  const monthlyTotal = plan.priceXof * 12;
  if (monthlyTotal <= 0) return null;
  return Math.round(((monthlyTotal - plan.annualPriceXof) / monthlyTotal) * 100);
}
