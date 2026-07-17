/**
 * Types du domaine « subscription » (plans Basique/Standard/Pro).
 */
import type { VideoFilterId } from "@/features/recorder";

export type PlanId = "basic" | "standard" | "pro";

/** Plan tarifaire — prix et limites éditables par un admin, jamais en dur ailleurs. */
export interface Plan {
  id: PlanId;
  name: string;
  /** Prix en francs CFA (XOF), montant entier (pas de sous-unité). */
  priceXof: number;
  /** Durée max d'un clip, en secondes ; `null` = illimité. */
  maxDurationSec: number | null;
  /** Nombre max de scripts sauvegardés ; `null` = illimité. */
  maxScripts: number | null;
  /** Filigrane visible sur les exports. */
  watermark: boolean;
  /** Filtres vidéo débloqués pour ce plan. */
  unlockedFilters: VideoFilterId[];
}
