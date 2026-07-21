/**
 * Types du domaine « subscription » (plans Basique/Standard/Pro).
 */
import type { VideoFilterId } from "@/features/recorder";

export type PlanId = "basic" | "standard" | "pro";

/** Plan tarifaire — prix et limites éditables par un admin, jamais en dur ailleurs. */
export interface Plan {
  id: PlanId;
  name: string;
  /** Prix mensuel en francs CFA (XOF), montant entier (pas de sous-unité). */
  priceXof: number;
  /** Prix mensuel barré (avant promo) ; `null` = aucun prix barré affiché. */
  priceBarredXof: number | null;
  /** Prix annuel (XOF) ; `null` = pas de palier annuel proposé pour ce plan. */
  annualPriceXof: number | null;
  /** Prix annuel barré (avant promo) ; `null` = aucun prix barré affiché. */
  annualPriceBarredXof: number | null;
  /** Durée max d'un clip, en secondes ; `null` = illimité. */
  maxDurationSec: number | null;
  /** Nombre max de scripts sauvegardés ; `null` = illimité. */
  maxScripts: number | null;
  /** Filigrane visible sur les exports. */
  watermark: boolean;
  /** Filtres vidéo débloqués pour ce plan. */
  unlockedFilters: VideoFilterId[];
  /** Import de script depuis un fichier (.txt). */
  scriptImport: boolean;
}
