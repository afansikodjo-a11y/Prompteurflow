/**
 * Types du domaine « recordings » (clips vidéo enregistrés et persistés).
 */

/** Métadonnées légères d'un clip (sans le blob, qui est stocké à part). */
export interface RecordingMeta {
  id: string;
  /** Horodatage de création (ms epoch). */
  createdAt: number;
  /** Durée du clip, en secondes. */
  durationSec: number;
  /** Taille du blob, en octets. */
  size: number;
  mimeType: string;
  /** `true` si récupéré après une interruption (crash/onglet tué) plutôt que sauvegardé normalement — durée estimée, pas exacte. */
  recovered?: boolean;
}
