"use client";

import * as React from "react";

import {
  addRecording,
  deleteRecording,
  getAllRecordings,
  getRecordingBlob,
} from "../lib/recordings-db";
import type { RecordingMeta } from "../types";

export interface UseRecordingsResult {
  /** Clips triés du plus récent au plus ancien. */
  recordings: RecordingMeta[];
  loading: boolean;
  /** Sauvegarde un clip et retourne son id. */
  add: (blob: Blob, durationSec: number) => Promise<string>;
  remove: (id: string) => Promise<void>;
  /** Crée une URL objet pour lire/télécharger un clip (à révoquer après usage). */
  getObjectUrl: (id: string) => Promise<string | null>;
  refresh: () => Promise<void>;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Gère la bibliothèque de clips persistée en IndexedDB.
 * Ne charge que les métadonnées en mémoire ; les blobs sont lus à la demande.
 */
export function useRecordings(): UseRecordingsResult {
  const [recordings, setRecordings] = React.useState<RecordingMeta[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const all = await getAllRecordings();
      setRecordings(all.sort((a, b) => b.createdAt - a.createdAt));
    } catch {
      // Stockage indisponible : on garde une liste vide.
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = React.useCallback(
    async (blob: Blob, durationSec: number) => {
      const meta: RecordingMeta = {
        id: generateId(),
        createdAt: Date.now(),
        durationSec,
        size: blob.size,
        mimeType: blob.type || "video/webm",
      };
      await addRecording(meta, blob);
      await refresh();
      return meta.id;
    },
    [refresh],
  );

  const remove = React.useCallback(
    async (id: string) => {
      await deleteRecording(id);
      await refresh();
    },
    [refresh],
  );

  const getObjectUrl = React.useCallback(async (id: string) => {
    const blob = await getRecordingBlob(id);
    return blob ? URL.createObjectURL(blob) : null;
  }, []);

  return { recordings, loading, add, remove, getObjectUrl, refresh };
}
