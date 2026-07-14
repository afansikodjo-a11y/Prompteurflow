"use client";

import * as React from "react";

interface UsePlaybackShortcutsOptions {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  /** Ajuste la vitesse d'un delta (px/s). */
  adjustSpeed: (delta: number) => void;
  /** Pas d'incrément de vitesse pour ↑/↓. */
  speedStep: number;
  enabled?: boolean;
}

/** Vrai si l'élément est un champ éditable (où les touches doivent rester natives). */
function isEditableTarget(element: Element | null): boolean {
  if (!(element instanceof HTMLElement)) return false;
  if (element.isContentEditable) return true;
  const tag = element.tagName;
  if (tag !== "INPUT" && tag !== "TEXTAREA") return false;
  return !(element as HTMLInputElement | HTMLTextAreaElement).readOnly;
}

/**
 * Raccourcis clavier du prompteur :
 * - `Espace` : Lecture / Pause
 * - `Échap` : Stop
 * - `↑` / `↓` : vitesse + / −
 *
 * Les raccourcis sont neutralisés lorsqu'un champ éditable a le focus (pour ne
 * pas voler la frappe pendant l'édition du script).
 */
export function usePlaybackShortcuts({
  isPlaying,
  play,
  pause,
  stop,
  adjustSpeed,
  speedStep,
  enabled = true,
}: UsePlaybackShortcutsOptions) {
  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(document.activeElement)) return;

      switch (event.code) {
        case "Space":
          event.preventDefault();
          if (isPlaying) pause();
          else play();
          break;
        case "Escape":
          stop();
          break;
        case "ArrowUp":
          event.preventDefault();
          adjustSpeed(speedStep);
          break;
        case "ArrowDown":
          event.preventDefault();
          adjustSpeed(-speedStep);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, isPlaying, play, pause, stop, adjustSpeed, speedStep]);
}
