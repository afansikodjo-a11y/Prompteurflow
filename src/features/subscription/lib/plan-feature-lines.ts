import type { Plan } from "../types";

/** `maxDurationSec` (stocké en secondes) en minutes lisibles — "1 minute", "2 minutes", "1.5 minutes". */
function formatDurationMinutes(sec: number): string {
  const minutes = Math.round((sec / 60) * 10) / 10;
  const label = Number.isInteger(minutes) ? String(minutes) : minutes.toFixed(1);
  return `${label} minute${minutes > 1 ? "s" : ""}`;
}

/**
 * Traduit les limites réelles du plan en lignes lisibles — jamais de texte
 * marketing déconnecté des vraies valeurs. Partagé entre la section tarifs
 * (landing) et la carte d'abonnement (paramètres) : une seule source pour
 * ne jamais laisser les deux affichages diverger.
 */
export function planFeatureLines(plan: Plan): string[] {
  const lines = [
    plan.maxDurationSec === null
      ? "Enregistrement sans limite de durée"
      : `Clips jusqu'à ${formatDurationMinutes(plan.maxDurationSec)}`,
    plan.maxScripts === null ? "Scripts illimités" : `${plan.maxScripts} scripts sauvegardés`,
    plan.watermark ? "Filigrane à l'export" : "Aucun filigrane",
  ];
  if (plan.scriptImport) lines.push("Import de script depuis un fichier (.txt)");
  if (plan.aiWriter) lines.push("Rédaction et amélioration de script par IA");
  return lines;
}
