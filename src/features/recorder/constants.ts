import type { CaptureSettings, FacingMode, ResolutionPreset, VideoFilterId } from "./types";

/** Caméra utilisée par défaut : frontale (cas d'usage « talking head »). */
export const DEFAULT_FACING_MODE: FacingMode = "user";

/** Valeur sentinelle « automatique » pour les listes déroulantes de périphériques. */
export const CAPTURE_AUTO = "auto";

/** Préréglages de résolution → contraintes `width`/`height` idéales. */
export const RESOLUTION_PRESETS: Record<
  ResolutionPreset,
  { label: string; width: number; height: number }
> = {
  "480p": { label: "480p", width: 854, height: 480 },
  "720p": { label: "720p · HD", width: 1280, height: 720 },
  "1080p": { label: "1080p · Full HD", width: 1920, height: 1080 },
};

/** Réglages de capture par défaut. */
export const DEFAULT_CAPTURE_SETTINGS: CaptureSettings = {
  facingMode: DEFAULT_FACING_MODE,
  resolution: "720p",
};

/** Filtre de style vidéo par défaut (aucun traitement). */
export const DEFAULT_VIDEO_FILTER: VideoFilterId = "none";

/**
 * Préréglages de filtre visuel → valeur CSS `filter` (compatible `CanvasRenderingContext2D.filter`).
 * Volontairement sobres : ce sont des presets de style, pas de la retouche fine.
 */
export const FILTER_PRESETS: Record<VideoFilterId, { label: string; cssFilter: string }> = {
  none: { label: "Aucun", cssFilter: "none" },
  warm: {
    label: "Chaud",
    cssFilter: "sepia(0.25) saturate(1.35) contrast(1.05) brightness(1.03)",
  },
  cool: {
    label: "Froid",
    cssFilter: "hue-rotate(-8deg) saturate(1.15) contrast(1.08) brightness(1.02)",
  },
  bw: { label: "Noir & blanc", cssFilter: "grayscale(1) contrast(1.15)" },
  cinema: { label: "Cinéma", cssFilter: "contrast(1.2) saturate(0.85) brightness(0.95)" },
};

/**
 * Formats d'encodage vidéo par ordre de préférence.
 * On retient le premier réellement supporté par le navigateur.
 */
const MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4",
] as const;

/** Retourne le meilleur type MIME supporté, ou une chaîne vide si indéterminé. */
export function pickSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}
