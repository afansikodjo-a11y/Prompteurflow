"use client";

import * as React from "react";

import { RESOLUTION_PRESETS } from "../constants";
import type { CameraStatus, CaptureSettings } from "../types";

export interface UseCameraResult {
  /** Flux média actif (vidéo + audio) ou `null` s'il n'est pas encore prêt. */
  stream: MediaStream | null;
  status: CameraStatus;
  error: string | null;
  /** (Re)démarre la caméra avec les réglages courants (bouton « Réessayer »). */
  start: () => Promise<void>;
  /** Coupe le flux et libère la caméra. */
  stop: () => void;
}

/** Construit les contraintes `getUserMedia` à partir des réglages de capture. */
function buildConstraints(settings: CaptureSettings): MediaStreamConstraints {
  const resolution = RESOLUTION_PRESETS[settings.resolution];

  const video: MediaTrackConstraints = {
    width: { ideal: resolution.width },
    height: { ideal: resolution.height },
  };
  if (settings.videoDeviceId) {
    video.deviceId = { exact: settings.videoDeviceId };
  } else {
    video.facingMode = settings.facingMode;
  }

  // Le navigateur active par défaut le pipeline de traitement vocal
  // (echoCancellation/noiseSuppression/autoGainControl) prévu pour les appels
  // WebRTC : il normalise et atténue fortement le niveau capté par rapport à
  // l'appli caméra native. On le désactive pour un volume proche du brut.
  const audio: MediaTrackConstraints = {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    ...(settings.audioDeviceId ? { deviceId: { exact: settings.audioDeviceId } } : {}),
  };

  return { video, audio };
}

/**
 * Gère l'accès à la caméra via `getUserMedia`, piloté par des réglages.
 *
 * Le hook est « contrôlé » : il ne détient aucun réglage propre. À chaque
 * changement de `settings` (caméra, micro, résolution, sens), le flux est
 * recréé ; les pistes sont libérées au démontage et entre deux flux.
 *
 * `enabled` permet de couper la caméra sans démonter le composant (ex. mode
 * lecture plein écran sans caméra) : le matériel est réellement libéré, pas
 * seulement masqué à l'écran.
 */
export function useCamera(settings: CaptureSettings, enabled = true): UseCameraResult {
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [status, setStatus] = React.useState<CameraStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const stop = React.useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    setStatus("idle");
  }, []);

  const start = React.useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");
    setError(null);
    streamRef.current?.getTracks().forEach((track) => track.stop());

    try {
      let media: MediaStream;
      try {
        media = await navigator.mediaDevices.getUserMedia(buildConstraints(settings));
      } catch (err) {
        const name = (err as DOMException).name;
        const hasExplicitDevice = Boolean(settings.videoDeviceId || settings.audioDeviceId);
        if (hasExplicitDevice && (name === "OverconstrainedError" || name === "NotFoundError")) {
          // Appareil enregistré introuvable → repli sur les périphériques par défaut.
          media = await navigator.mediaDevices.getUserMedia(
            buildConstraints({ ...settings, videoDeviceId: undefined, audioDeviceId: undefined }),
          );
        } else {
          throw err;
        }
      }
      streamRef.current = media;
      setStream(media);
      setStatus("ready");
    } catch (err) {
      const domError = err as DOMException;
      const denied = domError.name === "NotAllowedError" || domError.name === "SecurityError";
      setStatus(denied ? "denied" : "error");
      setError(domError.message || "Impossible d'accéder à la caméra.");
    }
  }, [settings]);

  React.useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    void start();
    return () => stop();
  }, [enabled, start, stop]);

  return { stream, status, error, start, stop };
}
