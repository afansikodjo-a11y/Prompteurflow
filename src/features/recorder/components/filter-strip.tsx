"use client";

import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { FILTER_PRESETS } from "../constants";
import type { VideoFilterId } from "../types";

interface FilterStripProps {
  value: VideoFilterId;
  onChange: (filter: VideoFilterId) => void;
  /** Filtres accessibles au plan courant ; les autres sont grisés (cadenas). */
  unlockedFilters: VideoFilterId[];
  /** Appelé au tap sur un filtre verrouillé, à la place de `onChange`. */
  onLockedSelect?: (filter: VideoFilterId) => void;
  className?: string;
}

const FILTER_ORDER: VideoFilterId[] = ["none", "warm", "cool", "bw", "cinema"];

/**
 * Sélecteur de filtre vidéo posé directement sur la scène : aperçu et choix
 * en un tap, sans passer par les réglages de capture.
 */
export function FilterStrip({
  value,
  onChange,
  unlockedFilters,
  onLockedSelect,
  className,
}: FilterStripProps) {
  return (
    <div
      className={cn(
        "flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {FILTER_ORDER.map((key) => {
        const unlocked = unlockedFilters.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => (unlocked ? onChange(key) : onLockedSelect?.(key))}
            aria-pressed={value === key}
            aria-disabled={!unlocked}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur transition-colors",
              value === key
                ? "bg-white text-black"
                : unlocked
                  ? "bg-black/40 text-white hover:bg-black/60"
                  : "bg-black/40 text-white/50 hover:bg-black/60",
            )}
          >
            {!unlocked && <Lock className="size-3" />}
            {FILTER_PRESETS[key].label}
          </button>
        );
      })}
    </div>
  );
}
