"use client";

import * as React from "react";

export interface UseFullscreenResult<T extends HTMLElement> {
  /** Ref à attacher à l'élément à passer en plein écran. */
  ref: React.RefObject<T | null>;
  isFullscreen: boolean;
  toggle: () => Promise<void>;
}

/**
 * Bascule un élément en plein écran via la Fullscreen API.
 * Hook transverse réutilisable (studio, aperçu vidéo…).
 */
export function useFullscreen<T extends HTMLElement>(): UseFullscreenResult<T> {
  const ref = React.useRef<T | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggle = React.useCallback(async () => {
    const element = ref.current;
    if (!element || typeof document === "undefined") return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await element.requestFullscreen();
      }
    } catch {
      // Plein écran non disponible (ex. iOS Safari) : on ignore silencieusement.
    }
  }, []);

  return { ref, isFullscreen, toggle };
}
