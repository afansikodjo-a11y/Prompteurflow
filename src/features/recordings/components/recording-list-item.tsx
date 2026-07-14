"use client";

import { Download, Play, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatBytes, formatClipDate, formatClipDuration } from "../utils";
import type { RecordingMeta } from "../types";

interface RecordingListItemProps {
  recording: RecordingMeta;
  active: boolean;
  onPlay: () => void;
  onDownload: () => void;
  onRemove: () => void;
}

/** Ligne de la bibliothèque de clips : lecture, téléchargement, suppression. */
export function RecordingListItem({
  recording,
  active,
  onPlay,
  onDownload,
  onRemove,
}: RecordingListItemProps) {
  return (
    <li
      className={cn(
        "flex items-center gap-1 rounded-md border p-2",
        active ? "border-primary bg-accent" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={onPlay}
        className="flex min-w-0 flex-1 flex-col items-start text-left"
      >
        <span className="text-sm font-medium">{formatClipDate(recording.createdAt)}</span>
        <span className="text-muted-foreground text-xs">
          {formatClipDuration(recording.durationSec)} · {formatBytes(recording.size)}
        </span>
      </button>

      <Button size="icon" variant="ghost" onClick={onPlay} aria-label="Lire">
        <Play className="size-4" />
      </Button>
      <Button size="icon" variant="ghost" onClick={onDownload} aria-label="Télécharger">
        <Download className="size-4" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Supprimer" className="text-destructive">
            <Trash2 className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet enregistrement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le clip sera définitivement supprimé. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={onRemove}
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/40 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
