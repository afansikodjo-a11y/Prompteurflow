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
  /**
   * `true` si la piste vidéo s'est interrompue de façon prolongée (>5s)
   * après un démarrage réussi — caméra coupée/réclamée par le système,
   * incident matériel, etc. Ni `getUserMedia` ni ce hook ne lèvent d'erreur
   * dans ce cas : la piste arrête juste de livrer des images, en silence
   * (constaté : image figée pendant qu'un enregistrement continuait
   * plusieurs minutes sans que rien ne le signale). Ne se réinitialise que
   * sur un nouveau `start()` réussi — à l'appelant de réagir (Studio arrête
   * l'enregistrement en cours proprement, ce qui sauvegarde ce qui a déjà
   * été capté, et prévient l'utilisateur).
   */
  interrupted: boolean;
}

/** Construit les contraintes `getUserMedia` à partir des réglages de capture. */
function buildConstraints(settings: CaptureSettings): MediaStreamConstraints {
  const resolution = RESOLUTION_PRESETS[settings.resolution];

  const video: MediaTrackConstraints = {
    width: { ideal: resolution.width },
    height: { ideal: resolution.height },
    // Sans ça, le navigateur choisit sa propre cadence par défaut — parfois
    // plus basse que ce qu'une appli caméra native utilise, ce qui peut
    // aussi se voir comme un rendu moins net/moins fluide.
    frameRate: { ideal: 30 },
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
/** Détache les écouteurs posés par ce hook avant de stopper une piste — sans ça, notre propre `.stop()` intentionnel pourrait être pris pour une interruption. */
function detachTrackWatchers(track: MediaStreamTrack): void {
  track.onended = null;
  track.onmute = null;
  track.onunmute = null;
}

export function useCamera(settings: CaptureSettings, enabled = true): UseCameraResult {
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [status, setStatus] = React.useState<CameraStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [interrupted, setInterrupted] = React.useState(false);
  const streamRef = React.useRef<MediaStream | null>(null);
  const muteTimeoutRef = React.useRef<number | null>(null);

  const clearMuteTimeout = React.useCallback(() => {
    if (muteTimeoutRef.current !== null) {
      window.clearTimeout(muteTimeoutRef.current);
      muteTimeoutRef.current = null;
    }
  }, []);

  const stop = React.useCallback(() => {
    clearMuteTimeout();
    streamRef.current?.getTracks().forEach((track) => {
      detachTrackWatchers(track);
      track.stop();
    });
    streamRef.current = null;
    setStream(null);
    setStatus("idle");
  }, [clearMuteTimeout]);

  const start = React.useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");
    setError(null);
    clearMuteTimeout();
    streamRef.current?.getTracks().forEach((track) => {
      detachTrackWatchers(track);
      track.stop();
    });

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
      setInterrupted(false);

      // Surveille la piste vidéo : une caméra coupée/réclamée par le
      // système ne lève aucune erreur getUserMedia, elle arrête juste de
      // livrer des images. `mute` peut être transitoire (bref incident) —
      // on laisse 5s avant de considérer que c'est réellement interrompu,
      // pour ne pas réagir à un simple à-coup.
      const [videoTrack] = media.getVideoTracks();
      if (videoTrack) {
        videoTrack.onended = () => setInterrupted(true);
        videoTrack.onmute = () => {
          clearMuteTimeout();
          muteTimeoutRef.current = window.setTimeout(() => setInterrupted(true), 5000);
        };
        videoTrack.onunmute = () => clearMuteTimeout();
      }
    } catch (err) {
      const domError = err as DOMException;
      const denied = domError.name === "NotAllowedError" || domError.name === "SecurityError";
      setStatus(denied ? "denied" : "error");
      setError(domError.message || "Impossible d'accéder à la caméra.");
    }
  }, [settings, clearMuteTimeout]);

  React.useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    void start();
    return () => stop();
  }, [enabled, start, stop]);

  return { stream, status, error, start, stop, interrupted };
}
