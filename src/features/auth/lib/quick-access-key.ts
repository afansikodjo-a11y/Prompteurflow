/**
 * Clé AES dérivée du code, gardée en mémoire (jamais persistée — c'est ce
 * qui rend « le code n'est jamais stocké » littéralement vrai) le temps de
 * la page, posée après une activation ou un déverrouillage réussi. Sert à
 * resynchroniser le refresh token chiffré à chaque rotation (voir
 * `quick-access-sync.ts`) sans redemander le code entre-temps.
 *
 * Singleton au niveau module, même motif que `src/lib/supabase/client.ts`.
 */
let quickAccessKey: CryptoKey | null = null;

export function setQuickAccessKey(key: CryptoKey): void {
  quickAccessKey = key;
}

export function getQuickAccessKey(): CryptoKey | null {
  return quickAccessKey;
}

export function clearQuickAccessKey(): void {
  quickAccessKey = null;
}
