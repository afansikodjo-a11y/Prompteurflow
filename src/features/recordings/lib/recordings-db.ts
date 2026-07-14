import type { RecordingMeta } from "../types";

/**
 * Persistance des clips vidéo via IndexedDB.
 *
 * Deux object stores :
 * - `recordings` : métadonnées légères (listées sans charger les blobs) ;
 * - `recording-blobs` : les blobs vidéo, indexés par id.
 *
 * Wrapper volontairement minimal (pas de dépendance externe) car nos besoins se
 * limitent à add / list / getBlob / delete sur un schéma simple.
 */
const DB_NAME = "prompteurflow";
const DB_VERSION = 1;
const META_STORE = "recordings";
const BLOB_STORE = "recording-blobs";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB indisponible dans cet environnement."));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(BLOB_STORE)) {
          db.createObjectStore(BLOB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Enregistre un clip (métadonnées + blob) de façon atomique. */
export async function addRecording(meta: RecordingMeta, blob: Blob): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([META_STORE, BLOB_STORE], "readwrite");
    tx.objectStore(META_STORE).put(meta);
    tx.objectStore(BLOB_STORE).put(blob, meta.id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** Retourne toutes les métadonnées (sans charger les blobs). */
export async function getAllRecordings(): Promise<RecordingMeta[]> {
  const db = await openDatabase();
  const tx = db.transaction(META_STORE, "readonly");
  return promisifyRequest(tx.objectStore(META_STORE).getAll() as IDBRequest<RecordingMeta[]>);
}

/** Retourne le blob d'un clip, ou `null` s'il n'existe plus. */
export async function getRecordingBlob(id: string): Promise<Blob | null> {
  const db = await openDatabase();
  const tx = db.transaction(BLOB_STORE, "readonly");
  const blob = await promisifyRequest(
    tx.objectStore(BLOB_STORE).get(id) as IDBRequest<Blob | undefined>,
  );
  return blob ?? null;
}

/** Supprime un clip (métadonnées + blob). */
export async function deleteRecording(id: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([META_STORE, BLOB_STORE], "readwrite");
    tx.objectStore(META_STORE).delete(id);
    tx.objectStore(BLOB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
