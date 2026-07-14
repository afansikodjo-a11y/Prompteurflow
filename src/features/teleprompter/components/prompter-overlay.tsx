"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface PrompterOverlayProps {
  value: string;
  onChange: (value: string) => void;
  /** Taille de police en pixels. */
  fontSize: number;
  /** En lecture, le texte n'est plus éditable (évite de perturber le défilement). */
  readOnly?: boolean;
  /** Retourne le texte horizontalement (prompteur à vitre / beam-splitter). */
  mirrored?: boolean;
  /** Mode édition : fond plein + texte aligné à gauche pour une saisie confortable. */
  editing?: boolean;
  /** Ref vers la zone défilante (fournie par `useTeleprompter`). */
  ref?: React.Ref<HTMLTextAreaElement>;
  className?: string;
}

/**
 * Grande zone de texte superposée à l'aperçu caméra.
 *
 * - Éditable à l'arrêt, en lecture seule pendant le défilement.
 * - Texte blanc à fort contraste (ombre + léger voile) pour rester lisible
 *   par-dessus la vidéo.
 * - Le padding vertical `50vh` fait démarrer la première ligne au centre de
 *   l'écran, comme un vrai téléprompteur.
 */
export function PrompterOverlay({
  value,
  onChange,
  fontSize,
  readOnly,
  mirrored,
  editing,
  ref,
  className,
}: PrompterOverlayProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {/* Voile : plein en édition (lisibilité au clavier), dégradé en lecture. */}
      <div
        className={cn(
          "absolute inset-0",
          editing ? "bg-black/85" : "bg-gradient-to-b from-black/50 via-black/20 to-black/60",
        )}
      />

      <Textarea
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        aria-label="Texte du téléprompteur"
        placeholder="Écrivez ou collez votre texte ici…"
        style={{ fontSize, lineHeight: 1.5 }}
        className={cn(
          "pointer-events-auto relative z-10 h-full w-full resize-none rounded-none border-0 bg-transparent px-6 font-semibold tracking-tight text-white shadow-none outline-none md:px-16",
          "placeholder:text-white/50 focus-visible:ring-0",
          "[text-shadow:0_2px_12px_rgba(0,0,0,0.7)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          editing ? "py-8 text-left" : "py-[50vh] text-center",
          mirrored && !editing && "-scale-x-100",
        )}
      />
    </div>
  );
}
