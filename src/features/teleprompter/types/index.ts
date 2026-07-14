/**
 * Types du domaine « teleprompter » (texte + défilement).
 */

/** État de lecture du défilement. */
export type PlaybackStatus = "idle" | "playing" | "paused";

/** Réglages d'affichage du prompteur. */
export interface TeleprompterSettings {
  /** Vitesse de défilement, en pixels par seconde. */
  speed: number;
  /** Taille de police du texte, en pixels. */
  fontSize: number;
}
