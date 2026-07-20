"use client";

import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const DEFAULT_LINES = [
  "Bienvenue sur PrompteurFlow.",
  "Ton texte défile pendant que tu filmes.",
  "Regarde la caméra, pas ton texte.",
  "Crée tes vidéos sans jamais les mémoriser.",
];

const FILTER_LABELS = ["Aucun", "Chaud", "Froid", "N&B"];

interface PrompterMockupProps {
  className?: string;
  lines?: string[];
  /** Affiche la pastille REC (scène en train de tourner) ou l'état aperçu. */
  recording?: boolean;
  /** Affiche la bande de filtres, comme sur la vraie scène du Studio. */
  showFilters?: boolean;
  /** Halo vert ambiant derrière le cadre — désactivé dans les compositions denses (grilles, cadres d'appareils). */
  glow?: boolean;
}

/**
 * Recréation fidèle de la scène réelle du Studio (voir
 * `src/features/studio/components/studio.tsx`) — pas une capture d'écran,
 * mais un composant qui reproduit honnêtement l'interface (fond sombre,
 * texte qui défile, pastille REC, bande de filtres). Remplaçable plus tard
 * par une vraie vidéo/capture (`/assets/marketing/...`) sans changer l'API.
 */
export function PrompterMockup({
  className,
  lines = DEFAULT_LINES,
  recording = true,
  showFilters = true,
  glow = false,
}: PrompterMockupProps) {
  return (
    <div className="relative">
      {glow && (
        <div
          aria-hidden
          className="bg-brand/25 absolute inset-6 -z-10 rounded-full blur-[80px]"
        />
      )}
      <div
        className={cn(
          "relative aspect-[9/16] w-full overflow-hidden rounded-[2rem] bg-neutral-950 shadow-2xl ring-1 ring-white/10",
          className,
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.brand/0.12),transparent_60%)]" />

        <motion.div
          className="absolute inset-x-0 top-1/2 flex flex-col gap-10 px-6 text-center"
          animate={{ y: ["15%", "-170%"] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        >
          {lines.map((line) => (
            <p
              key={line}
              className="text-lg leading-snug font-bold text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.8)] sm:text-xl"
            >
              {line}
            </p>
          ))}
        </motion.div>

        {recording ? (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
            <motion.span
              className="size-1.5 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
            REC
          </div>
        ) : (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
            <Sparkles className="text-brand-bright size-3" />
            Aperçu
          </div>
        )}

        {showFilters && (
          <div className="absolute inset-x-3 top-12 flex gap-1.5 overflow-hidden">
            {FILTER_LABELS.map((label, index) => (
              <span
                key={label}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur",
                  index === 0 ? "bg-brand text-black" : "bg-white/10 text-white/80",
                )}
              >
                {label}
              </span>
            ))}
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/40">
              <Lock className="size-2.5" />
              Cinéma
            </span>
          </div>
        )}

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-600 shadow-lg shadow-red-600/40">
            <div className="size-4 rounded-sm bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
