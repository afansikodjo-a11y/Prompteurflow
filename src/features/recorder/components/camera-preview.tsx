"use client";

import * as React from "react";
import { VideoOff } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CameraStatus } from "../types";

interface CameraPreviewProps {
  stream: MediaStream | null;
  status: CameraStatus;
  /** Miroir horizontal (recommandé pour la caméra frontale). */
  mirrored?: boolean;
  onRetry?: () => void;
}

const STATUS_MESSAGE: Record<Exclude<CameraStatus, "ready">, string> = {
  idle: "Initialisation de la caméra…",
  requesting: "Autorisez l'accès à la caméra pour commencer.",
  denied: "Accès à la caméra refusé. Vérifiez les autorisations du navigateur.",
  error: "Impossible d'accéder à la caméra.",
  unsupported: "Votre navigateur ne prend pas en charge la caméra.",
};

/**
 * Aperçu vidéo plein cadre. Sert de fond au Studio ; le texte du prompteur
 * se superpose par-dessus. Affiche un état de repli si la caméra est indisponible.
 */
export function CameraPreview({ stream, status, mirrored, onRetry }: CameraPreviewProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (video && video.srcObject !== stream) {
      video.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="absolute inset-0 bg-neutral-950">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={cn(
          "h-full w-full object-cover transition-opacity",
          mirrored && "-scale-x-100",
          stream ? "opacity-100" : "opacity-0",
        )}
      />

      {status !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-neutral-300">
          <VideoOff className="size-8" />
          <p className="max-w-xs text-sm text-pretty">{STATUS_MESSAGE[status]}</p>
          {(status === "denied" || status === "error") && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-sm font-medium text-white underline underline-offset-4"
            >
              Réessayer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
