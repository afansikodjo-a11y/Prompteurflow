/**
 * I/O `localStorage` de l'accès rapide — impérative et non le hook
 * `useLocalStorage`, car appelée depuis des callbacks crypto et le listener
 * `onAuthStateChange` de `AuthProvider`, hors du cycle de rendu React.
 */

export interface QuickAccessBlob {
  salt: string;
  iv: string;
  ciphertext: string;
}

const BLOB_KEY = "pf:quick-access";
const FAILS_KEY = "pf:quick-access-fails";
const OFFERED_KEY = "pf:quick-access-offered";

/** `5` échecs consécutifs → le code est effacé, retour au mot de passe. */
export const MAX_QUICK_ACCESS_ATTEMPTS = 5;

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getQuickAccessBlob(): QuickAccessBlob | null {
  if (!hasLocalStorage()) return null;
  const raw = window.localStorage.getItem(BLOB_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as QuickAccessBlob;
  } catch {
    return null;
  }
}

export function saveQuickAccessBlob(blob: QuickAccessBlob): void {
  if (!hasLocalStorage()) return;
  window.localStorage.setItem(BLOB_KEY, JSON.stringify(blob));
}

/** Efface le code et son compteur d'échecs — désactivation explicite, ou verrouillage après trop d'échecs. */
export function clearQuickAccess(): void {
  if (!hasLocalStorage()) return;
  window.localStorage.removeItem(BLOB_KEY);
  window.localStorage.removeItem(FAILS_KEY);
}

export function getFailCount(): number {
  if (!hasLocalStorage()) return 0;
  return Number(window.localStorage.getItem(FAILS_KEY) ?? 0);
}

/** Persisté (pas juste en mémoire) : un rechargement de page ne doit pas redonner des essais gratuits. */
export function incrementFailCount(): number {
  if (!hasLocalStorage()) return 0;
  const next = getFailCount() + 1;
  window.localStorage.setItem(FAILS_KEY, String(next));
  return next;
}

export function resetFailCount(): void {
  if (!hasLocalStorage()) return;
  window.localStorage.removeItem(FAILS_KEY);
}

/** A-t-on déjà proposé l'activation une fois sur cet appareil (pour ne pas re-proposer à chaque connexion) ? */
export function wasQuickAccessOffered(): boolean {
  if (!hasLocalStorage()) return true;
  return window.localStorage.getItem(OFFERED_KEY) === "1";
}

export function markQuickAccessOffered(): void {
  if (!hasLocalStorage()) return;
  window.localStorage.setItem(OFFERED_KEY, "1");
}
