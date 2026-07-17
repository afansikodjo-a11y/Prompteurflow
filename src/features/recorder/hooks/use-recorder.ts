"use client";

import * as React from "react";

import { pickSupportedMimeType } from "../constants";
import type { RecorderStatus } from "../types";

export interface UseRecorderResult {
  status: RecorderStatus;
  /** Durée écoulée d'enregistrement, en secondes. */
  elapsed: number;
  /** URL objet du dernier clip enregistré (à révoquer via `clear`), ou `null`. */
  recordingUrl: string | null;
  /** `true` si l'API MediaRecorder est disponible. */
  isSupported: boolean;
  start: () => void;
  /** Suspend l'enregistrement (le clip final ignore la pause). */
  pause: () => void;
  /** Reprend un enregistrement suspendu. */
  resume: () => void;
  stop: () => void;
  /** Supprime le clip courant et libère l'URL objet. */
  clear: () => void;
}

export interface UseRecorderOptions {
  /** Appelé à l'arrêt avec le clip final et sa durée (secondes) — ex. pour le persister. */
  onComplete?: (blob: Blob, durationSec: number) => void;
  /**
   * Durée max d'enregistrement, en secondes (plan Basique) — l'enregistrement
   * s'arrête automatiquement à ce plafond. `undefined` = illimité (Standard/Pro).
   */
  maxDurationSec?: number;
}

/**
 * Enregistre le flux caméra fourni via l'API `MediaRecorder`.
 *
 * Le clip produit est la vidéo brute (sans le texte du prompteur) — c'est
 * volontaire : le téléprompteur n'est qu'une aide à la lecture, pas un incrust.
 *
 * @param stream Flux média à enregistrer (issu de {@link useCamera}), ou `null`.
 */
export function useRecorder(
  stream: MediaStream | null,
  options: UseRecorderOptions = {},
): UseRecorderResult {
  const [status, setStatus] = React.useState<RecorderStatus>("idle");
  const [elapsed, setElapsed] = React.useState(0);
  const [recordingUrl, setRecordingUrl] = React.useState<string | null>(null);

  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<number | null>(null);
  const urlRef = React.useRef<string | null>(null);
  const elapsedRef = React.useRef(0);
  const onCompleteRef = React.useRef(options.onComplete);
  const maxDurationRef = React.useRef(options.maxDurationSec);

  // Maintient à jour, pour le handler `onstop` et le timer, le callback et le plafond courants.
  React.useEffect(() => {
    onCompleteRef.current = options.onComplete;
    maxDurationRef.current = options.maxDurationSec;
  });
  React.useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  const isSupported = typeof window !== "undefined" && typeof window.MediaRecorder !== "undefined";

  const stopTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = React.useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    setStatus("idle");
    stopTimer();
  }, [stopTimer]);

  // Le plafond de durée (plan Basique) est vérifié ici, dans le callback du
  // timer lui-même — jamais dans l'updater fonctionnel passé à `setElapsed`,
  // qui doit rester pur (React peut l'invoquer plusieurs fois, notamment en
  // StrictMode) et ne peut donc pas déclencher l'arrêt de l'enregistrement.
  const startTimer = React.useCallback(() => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      const next = elapsedRef.current + 1;
      elapsedRef.current = next;
      setElapsed(next);
      const max = maxDurationRef.current;
      if (max !== undefined && next >= max) stop();
    }, 1000);
  }, [stopTimer, stop]);

  const clear = React.useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setRecordingUrl(null);
    setElapsed(0);
  }, []);

  const start = React.useCallback(() => {
    if (!stream || !isSupported) return;

    clear();
    chunksRef.current = [];

    const mimeType = pickSupportedMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setRecordingUrl(url);
      onCompleteRef.current?.(blob, elapsedRef.current);
    };

    recorder.start();
    recorderRef.current = recorder;
    setStatus("recording");
    setElapsed(0);
    startTimer();
  }, [stream, isSupported, clear, startTimer]);

  const pause = React.useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.pause();
      setStatus("paused");
      stopTimer();
    }
  }, [stopTimer]);

  const resume = React.useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "paused") {
      recorder.resume();
      setStatus("recording");
      startTimer();
    }
  }, [startTimer]);

  // Nettoyage au démontage : arrêt du timer, du recorder et libération de l'URL.
  React.useEffect(() => {
    return () => {
      stopTimer();
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [stopTimer]);

  return { status, elapsed, recordingUrl, isSupported, start, pause, resume, stop, clear };
}
