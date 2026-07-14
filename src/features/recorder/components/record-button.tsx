"use client";

import { Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDuration } from "../utils";
import type { RecorderStatus } from "../types";

interface RecordButtonProps {
  status: RecorderStatus;
  elapsed: number;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
}

/**
 * Bouton unique d'enregistrement : démarre puis arrête la capture.
 * Affiche un point rouge au repos et la durée écoulée pendant l'enregistrement.
 */
export function RecordButton({ status, elapsed, disabled, onStart, onStop }: RecordButtonProps) {
  const isRecording = status !== "idle";

  return (
    <Button
      type="button"
      onClick={isRecording ? onStop : onStart}
      disabled={disabled}
      aria-label={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
      className="gap-2 bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/40"
    >
      {isRecording ? (
        <Square className="size-3.5 fill-current" />
      ) : (
        <span className="size-3 rounded-full bg-white" />
      )}
      <span className="tabular-nums">{isRecording ? formatDuration(elapsed) : "Enregistrer"}</span>
    </Button>
  );
}
