/**
 * API publique de la feature « recordings » (clips enregistrés, persistés en IndexedDB).
 */
export { useRecordings, type UseRecordingsResult } from "./hooks/use-recordings";
export { RecordingsLibrary } from "./components/recordings-library";
export type { RecordingMeta } from "./types";
