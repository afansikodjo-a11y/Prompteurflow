"use client";

import * as React from "react";

import {
  addRecording,
  beginRecordingSession,
  deleteRecording,
  endRecordingSession,
  getAllRecordings,
  getRecordingBlob,
  recoverOrphanSessions,
  saveRecordingChunk,
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
  /**
   * Sauvegarde incrémentale d'un enregistrement long en cours — à brancher
   * sur `onSessionStart`/`onChunk`/`onSessionEnd` de `useRecorder`, pour
   * qu'un crash pendant l'enregistrement ne fasse perdre que les dernières
   * secondes plutôt que le clip entier.
   */
  beginSession: () => Promise<string>;
  saveChunk: (sessionId: string, chunkIndex: number, chunk: Blob) => Promise<void>;
  endSession: (sessionId: string) => Promise<void>;
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
    // Récupère d'abord tout enregistrement interrompu (crash/onglet tué
    // avant l'arrêt normal) avant de charger la liste, pour qu'un clip
    // récupéré apparaisse dès ce premier chargement.
    void (async () => {
      try {
        await recoverOrphanSessions();
      } catch (error) {
        console.error("Échec de récupération d'un enregistrement interrompu :", error);
      }
      await refresh();
    })();
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

  const beginSession = React.useCallback(() => beginRecordingSession(), []);

  const saveChunk = React.useCallback(
    (sessionId: string, chunkIndex: number, chunk: Blob) => saveRecordingChunk(sessionId, chunkIndex, chunk),
    [],
  );

  const endSession = React.useCallback((sessionId: string) => endRecordingSession(sessionId), []);

  return {
    recordings,
    loading,
    add,
    remove,
    getObjectUrl,
    refresh,
    beginSession,
    saveChunk,
    endSession,
  };
}
