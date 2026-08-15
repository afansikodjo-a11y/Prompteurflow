import type { RecordingMeta } from "../types";

/**
 * Persistance des clips vidéo via IndexedDB.
 *
 * Quatre object stores :
 * - `recordings` : métadonnées légères (listées sans charger les blobs) ;
 * - `recording-blobs` : les blobs vidéo, indexés par id ;
 * - `recording-sessions` : une ligne par enregistrement en cours, supprimée
 *   à l'arrêt normal — une ligne encore présente au chargement suivant
 *   signale un enregistrement interrompu (crash, onglet tué par le système)
 *   à récupérer ;
 * - `recording-chunks` : les fragments d'un enregistrement en cours, écrits
 *   au fil de l'eau (voir `CHUNK_TIMESLICE_MS` dans la feature `recorder`)
 *   plutôt que gardés uniquement en mémoire jusqu'à l'arrêt — c'est ce qui
 *   permet de récupérer un enregistrement même si l'app n'a jamais atteint
 *   son arrêt normal.
 *
 * Wrapper volontairement minimal (pas de dépendance externe) car nos besoins
 * restent simples malgré ce quatrième store.
 */
const DB_NAME = "prompteurflow";
const DB_VERSION = 2;
const META_STORE = "recordings";
const BLOB_STORE = "recording-blobs";
const SESSION_STORE = "recording-sessions";
const CHUNK_STORE = "recording-chunks";
const CHUNK_SESSION_INDEX = "sessionId";

/** Doit rester synchronisé avec `CHUNK_TIMESLICE_MS` (feature `recorder`) — sert uniquement à estimer la durée d'un clip récupéré après crash, dont la vraie durée n'a jamais été enregistrée. */
const ESTIMATED_CHUNK_SECONDS = 3;

interface StoredChunk {
  sessionId: string;
  index: number;
  blob: Blob;
}

interface StoredSession {
  sessionId: string;
  startedAt: number;
}

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
        if (!db.objectStoreNames.contains(SESSION_STORE)) {
          db.createObjectStore(SESSION_STORE, { keyPath: "sessionId" });
        }
        if (!db.objectStoreNames.contains(CHUNK_STORE)) {
          const chunkStore = db.createObjectStore(CHUNK_STORE, { autoIncrement: true });
          chunkStore.createIndex(CHUNK_SESSION_INDEX, "sessionId");
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

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

/** Ouvre une session d'enregistrement — à appeler dès que `MediaRecorder` démarre réellement, jamais avant (voir `onSessionStart` dans `useRecorder`). */
export async function beginRecordingSession(): Promise<string> {
  const db = await openDatabase();
  const session: StoredSession = { sessionId: generateSessionId(), startedAt: Date.now() };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(SESSION_STORE, "readwrite");
    tx.objectStore(SESSION_STORE).put(session);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  return session.sessionId;
}

/** Sauvegarde un fragment de la session en cours. Échoue silencieusement en cas d'erreur (log serveur/console) : un fragment perdu ne doit jamais interrompre l'enregistrement lui-même. */
export async function saveRecordingChunk(sessionId: string, index: number, blob: Blob): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(CHUNK_STORE, "readwrite");
      const stored: StoredChunk = { sessionId, index, blob };
      tx.objectStore(CHUNK_STORE).add(stored);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (error) {
    console.error("Échec de sauvegarde d'un fragment d'enregistrement :", error);
  }
}

/** Supprime la session et ses fragments — à appeler une fois le clip final sauvegardé (`addRecording`) via `onSessionEnd`. */
export async function endRecordingSession(sessionId: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([SESSION_STORE, CHUNK_STORE], "readwrite");
    tx.objectStore(SESSION_STORE).delete(sessionId);
    const cursorRequest = tx.objectStore(CHUNK_STORE).index(CHUNK_SESSION_INDEX).openCursor(sessionId);
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/**
 * Récupère et sauvegarde comme clips normaux les sessions jamais terminées
 * proprement (ligne encore présente dans `recording-sessions`) — à appeler
 * une fois par chargement, avant `getAllRecordings`. Une session sans aucun
 * fragment (crash avant le premier `ondataavailable`, ~3s) est simplement
 * nettoyée, rien à récupérer.
 */
export async function recoverOrphanSessions(): Promise<void> {
  const db = await openDatabase();
  const sessions = await promisifyRequest(
    db.transaction(SESSION_STORE, "readonly").objectStore(SESSION_STORE).getAll() as IDBRequest<
      StoredSession[]
    >,
  );

  for (const session of sessions) {
    const chunkTx = db.transaction(CHUNK_STORE, "readonly");
    const rows = await promisifyRequest(
      chunkTx.objectStore(CHUNK_STORE).index(CHUNK_SESSION_INDEX).getAll(session.sessionId) as IDBRequest<
        StoredChunk[]
      >,
    );

    if (rows.length > 0) {
      const chunks = rows.sort((a, b) => a.index - b.index).map((row) => row.blob);
      const mimeType = chunks[0].type || "video/webm";
      const blob = new Blob(chunks, { type: mimeType });
      const meta: RecordingMeta = {
        id: generateSessionId(),
        createdAt: session.startedAt,
        durationSec: chunks.length * ESTIMATED_CHUNK_SECONDS,
        size: blob.size,
        mimeType,
        recovered: true,
      };
      await addRecording(meta, blob);
    }

    await endRecordingSession(session.sessionId);
  }
}
