"use client";

import { cn } from "@/lib/utils";
import { FILTER_PRESETS } from "../constants";
import type { VideoFilterId } from "../types";

interface FilterStripProps {
  value: VideoFilterId;
  onChange: (filter: VideoFilterId) => void;
  className?: string;
}

const FILTER_ORDER: VideoFilterId[] = ["none", "warm", "cool", "bw", "cinema"];

/**
 * Sélecteur de filtre vidéo posé directement sur la scène : aperçu et choix
 * en un tap, sans passer par les réglages de capture.
 */
export function FilterStrip({ value, onChange, className }: FilterStripProps) {
  return (
    <div
      className={cn(
        "flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {FILTER_ORDER.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur transition-colors",
            value === key ? "bg-white text-black" : "bg-black/40 text-white hover:bg-black/60",
          )}
        >
          {FILTER_PRESETS[key].label}
        </button>
      ))}
    </div>
  );
}
