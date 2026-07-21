import type { Plan } from "../types";

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
      : `Clips jusqu'à ${plan.maxDurationSec} secondes`,
    plan.maxScripts === null ? "Scripts illimités" : `${plan.maxScripts} scripts sauvegardés`,
    plan.unlockedFilters.length > 1 ? "Tous les filtres vidéo" : "Filtre vidéo de base",
    plan.watermark ? "Filigrane à l'export" : "Aucun filigrane",
  ];
  if (plan.scriptImport) lines.push("Import de script depuis un fichier (.txt)");
  if (plan.aiWriter) lines.push("Rédaction et amélioration de script par IA");
  return lines;
}
