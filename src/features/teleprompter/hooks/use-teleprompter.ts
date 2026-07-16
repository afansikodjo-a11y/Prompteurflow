"use client";

import * as React from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { FONT_SIZE, SPEED, STORAGE_KEYS } from "../constants";
import type { PlaybackStatus } from "../types";

export interface UseTeleprompterResult {
  status: PlaybackStatus;
  isPlaying: boolean;
  /** Vitesse de lecture, en mots par minute (WPM). */
  speed: number;
  setSpeed: (speed: number) => void;
  /** Ajuste la vitesse (WPM) d'un delta, borné à [SPEED.min, SPEED.max]. */
  adjustSpeed: (delta: number) => void;
  fontSize: number;
  setFontSize: (fontSize: number) => void;
  /** À attacher à l'élément défilant (la zone de texte). */
  scrollRef: React.RefObject<HTMLTextAreaElement | null>;
  play: () => void;
  pause: () => void;
  stop: () => void;
}

/** Compte les mots (séquences de caractères non blancs) d'un texte. */
function countWords(text: string): number {
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

/**
 * Pilote le défilement automatique du prompteur, exprimé en **mots par minute**.
 *
 * La vitesse cible (WPM) est convertie en pixels/seconde à partir d'une
 * calibration du contenu réellement mis en page :
 *   `px/s = (WPM / 60) × (hauteur_du_texte / nombre_de_mots)`
 *
 * La calibration (`pxParMot`) est recalculée au lancement, au changement de
 * taille de police et au redimensionnement de la fenêtre — jamais à chaque
 * frame (le texte étant figé en lecture, la mise en page est stable).
 *
 * Le défilement s'appuie sur `requestAnimationFrame` avec un déplacement
 * proportionnel au delta de temps réel : la vitesse perçue est indépendante du
 * taux de rafraîchissement de l'écran.
 */
export function useTeleprompter(): UseTeleprompterResult {
  const [status, setStatus] = React.useState<PlaybackStatus>("idle");
  const [speed, setSpeed] = useLocalStorage<number>(STORAGE_KEYS.speed, SPEED.default);
  const [fontSize, setFontSize] = useLocalStorage<number>(STORAGE_KEYS.fontSize, FONT_SIZE.default);

  const scrollRef = React.useRef<HTMLTextAreaElement | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const lastTimeRef = React.useRef<number | null>(null);
  const speedRef = React.useRef(speed);
  const pxPerWordRef = React.useRef(0);
  /** Progression de lecture (0-1), maintenue à jour pendant le défilement. */
  const scrollFractionRef = React.useRef(0);

  React.useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Calibration : pixels de texte par mot, hors padding de mise en page.
  const measure = React.useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    const style = window.getComputedStyle(element);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const textHeight = Math.max(0, element.scrollHeight - paddingTop - paddingBottom);
    const words = countWords(element.value);
    pxPerWordRef.current = words > 0 ? textHeight / words : 0;
  }, []);

  // (Re)calibre pendant la lecture : au démarrage, au changement de police, au resize.
  React.useEffect(() => {
    if (status !== "playing") return;
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [status, fontSize, measure]);

  // Changer la taille de police modifie la hauteur totale du texte : le
  // navigateur borne alors `scrollTop` à la volée sur le nouveau maximum, ce
  // qui peut déclencher à tort la détection de fin de texte au frame suivant
  // (et mettre en pause). On restaure la même progression (%) juste après le
  // reflow, avant que ce faux positif ne soit évalué.
  React.useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const maxScroll = element.scrollHeight - element.clientHeight;
    element.scrollTop = maxScroll > 0 ? scrollFractionRef.current * maxScroll : 0;
  }, [fontSize]);

  React.useEffect(() => {
    if (status !== "playing") return;

    const step = (time: number) => {
      const element = scrollRef.current;
      if (!element) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }

      if (lastTimeRef.current !== null) {
        const deltaSeconds = (time - lastTimeRef.current) / 1000;
        const pixelsPerSecond = (speedRef.current / 60) * pxPerWordRef.current;
        element.scrollTop += pixelsPerSecond * deltaSeconds;

        const maxScroll = element.scrollHeight - element.clientHeight;
        scrollFractionRef.current = maxScroll > 0 ? element.scrollTop / maxScroll : 0;

        // Fin du texte atteinte : on met en pause à la dernière ligne.
        if (element.scrollTop + element.clientHeight >= element.scrollHeight - 1) {
          setStatus("paused");
          lastTimeRef.current = null;
          return;
        }
      }

      lastTimeRef.current = time;
      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = null;
    };
  }, [status]);

  const adjustSpeed = React.useCallback((delta: number) => {
    setSpeed((current) => Math.min(SPEED.max, Math.max(SPEED.min, current + delta)));
  }, [setSpeed]);

  const play = React.useCallback(() => setStatus("playing"), []);
  const pause = React.useCallback(() => setStatus("paused"), []);
  const stop = React.useCallback(() => {
    setStatus("idle");
    scrollFractionRef.current = 0;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  return {
    status,
    isPlaying: status === "playing",
    speed,
    setSpeed,
    adjustSpeed,
    fontSize,
    setFontSize,
    scrollRef,
    play,
    pause,
    stop,
  };
}
