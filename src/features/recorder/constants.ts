import type { CaptureSettings, FacingMode, ResolutionPreset } from "./types";

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

/**
 * Débit vidéo cible (bits/s) par résolution, passé explicitement à
 * `MediaRecorder`. Sans ça, le navigateur retombe sur un débit générique
 * nettement inférieur à celui d'une appli caméra native, même à résolution
 * égale. Valeurs relevées à la hausse (vs un premier essai à 2,5/5/10 Mbps,
 * jugé encore insuffisant) pour se rapprocher des débits qu'une appli
 * caméra native cible habituellement à ces résolutions.
 */
export const VIDEO_BITRATE_BY_RESOLUTION: Record<ResolutionPreset, number> = {
  "480p": 4_000_000,
  "720p": 8_000_000,
  "1080p": 16_000_000,
};

/**
 * Formats d'encodage vidéo par ordre de préférence. On retient le premier
 * réellement supporté par le navigateur (`MediaRecorder.isTypeSupported`) —
 * un candidat non supporté est simplement ignoré, jamais une erreur.
 *
 * H.264/mp4 en tête : c'est le codec que la quasi-totalité des puces vidéo
 * mobiles accélèrent matériellement (le même bloc que l'appli caméra native
 * utilise), alors que VP8/VP9 tournent souvent en logiciel sur Chrome
 * Android — plus lent en temps réel, et généralement moins net à débit
 * égal. Le repli webm reste nécessaire : H.264/mp4 via MediaRecorder n'est
 * pas disponible partout (support Chrome variable selon la version/l'OS).
 */
const MIME_CANDIDATES = [
  "video/mp4;codecs=h264,aac",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
] as const;

/** Retourne le meilleur type MIME supporté, ou une chaîne vide si indéterminé. */
export function pickSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}
