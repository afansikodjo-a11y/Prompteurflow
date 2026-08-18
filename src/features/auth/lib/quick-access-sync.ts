import { encryptRefreshToken } from "./quick-access-crypto";
import { getQuickAccessKey } from "./quick-access-key";
import { getQuickAccessBlob, saveQuickAccessBlob } from "./quick-access-storage";

/**
 * Supabase fait tourner le refresh token à chaque utilisation, y compris
 * les rafraîchissements automatiques en arrière-plan pendant qu'une session
 * est ouverte — un code qui ne capturerait le refresh token qu'une fois, à
 * l'activation, cesserait de fonctionner silencieusement dès la première
 * rotation (quasi immédiat pour la plupart des utilisateurs, pas un cas
 * limite). À appeler depuis le listener `onAuthStateChange` d'`AuthProvider`
 * à chaque évènement `TOKEN_REFRESHED`/`SIGNED_IN`.
 *
 * Ne fait rien si aucune clé n'est en mémoire (accès rapide pas activé sur
 * cet appareil, ou onglet rouvert sans être passé par un déverrouillage) —
 * jamais une erreur, un rafraîchissement de session normal ne doit jamais
 * échouer à cause de cette synchronisation annexe.
 */
export async function resyncQuickAccessBlob(refreshToken: string): Promise<void> {
  const key = getQuickAccessKey();
  if (!key || !getQuickAccessBlob()) return;

  try {
    const { iv, ciphertext } = await encryptRefreshToken(key, refreshToken);
    const blob = getQuickAccessBlob();
    if (!blob) return;
    saveQuickAccessBlob({ salt: blob.salt, iv, ciphertext });
  } catch (error) {
    console.error("Échec de resynchronisation de l'accès rapide :", error);
  }
}
