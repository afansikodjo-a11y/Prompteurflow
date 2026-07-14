"use client";

import * as React from "react";
import { Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RecordingListItem } from "./recording-list-item";
import type { RecordingMeta } from "../types";

interface RecordingsLibraryProps {
  recordings: RecordingMeta[];
  getObjectUrl: (id: string) => Promise<string | null>;
  onRemove: (id: string) => void;
}

/**
 * Bibliothèque de clips : un déclencheur (avec compteur) et un tiroir affichant
 * un aperçu vidéo + la liste des enregistrements (lire / télécharger / supprimer).
 */
export function RecordingsLibrary({ recordings, getObjectUrl, onRemove }: RecordingsLibraryProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Révoque l'URL de prévisualisation précédente à chaque changement / démontage.
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePlay = async (recording: RecordingMeta) => {
    const url = await getObjectUrl(recording.id);
    setSelectedId(recording.id);
    setPreviewUrl(url);
  };

  const handleDownload = async (recording: RecordingMeta) => {
    const url = await getObjectUrl(recording.id);
    if (!url) return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `prompteurflow-${recording.id}.webm`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleRemove = (id: string) => {
    if (id === selectedId) {
      setSelectedId(null);
      setPreviewUrl(null);
    }
    onRemove(id);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Video className="size-4" />
          Mes vidéos
          {recordings.length > 0 && (
            <span className="bg-primary text-primary-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium">
              {recordings.length}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Mes enregistrements</SheetTitle>
          <SheetDescription>Vos clips sont conservés sur cet appareil.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-3 overflow-y-auto p-3">
          {previewUrl && (
            <video
              key={selectedId}
              src={previewUrl}
              controls
              autoPlay
              className="aspect-video w-full rounded-md bg-black"
            />
          )}

          {recordings.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Aucun enregistrement pour le moment.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {recordings.map((recording) => (
                <RecordingListItem
                  key={recording.id}
                  recording={recording}
                  active={recording.id === selectedId}
                  onPlay={() => void handlePlay(recording)}
                  onDownload={() => void handleDownload(recording)}
                  onRemove={() => handleRemove(recording.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
