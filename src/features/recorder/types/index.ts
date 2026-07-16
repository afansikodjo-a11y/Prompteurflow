/**
 * Types du domaine « recorder » (caméra + enregistrement vidéo).
 */

/** Sens de la caméra : `user` = frontale (selfie), `environment` = arrière. */
export type FacingMode = "user" | "environment";

/** État du flux caméra (getUserMedia). */
export type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "error" | "unsupported";

/** État de l'enregistrement (MediaRecorder). */
export type RecorderStatus = "idle" | "recording" | "paused";

/** Préréglage de résolution vidéo. */
export type ResolutionPreset = "480p" | "720p" | "1080p";

/** Filtre de style visuel appliqué à l'image (gravé dans l'enregistrement). */
export type VideoFilterId = "none" | "warm" | "cool" | "bw" | "cinema";

/** Réglages de capture (source de vérité détenue par le Studio). */
export interface CaptureSettings {
  facingMode: FacingMode;
  /** Caméra explicite ; si absent, on retombe sur `facingMode`. */
  videoDeviceId?: string;
  /** Micro explicite ; si absent, micro par défaut du système. */
  audioDeviceId?: string;
  resolution: ResolutionPreset;
}
