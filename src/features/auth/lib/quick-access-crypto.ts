/**
 * Primitives crypto pures pour l'accès rapide par code à 4 chiffres —
 * aucune I/O ici (voir `quick-access-storage.ts`/`quick-access-key.ts`).
 *
 * Le code protège une copie chiffrée du refresh token Supabase, stockée
 * localement sur l'appareil. Avec seulement 10 000 combinaisons possibles,
 * le coût de PBKDF2 (~100k itérations) ralentit un devinage via l'interface
 * mais ne protège PAS contre un essai exhaustif hors-ligne si quelqu'un
 * récupère directement les octets chiffrés (vol d'appareil, accès au
 * stockage) — la vraie protection vient de l'isolation du navigateur et de
 * la confiance physique dans l'appareil, comme le code de verrouillage
 * d'une appli mobile. Jamais un remplacement du mot de passe.
 */

const PBKDF2_ITERATIONS = 100_000;
const AES_KEY_LENGTH = 256;
const IV_LENGTH_BYTES = 12;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

// Backé explicitement par un vrai `ArrayBuffer` (pas `ArrayBufferLike`, qui
// englobe aussi `SharedArrayBuffer`) : `Uint8Array<ArrayBufferLike>` n'est
// plus assignable à `BufferSource` (`crypto.subtle.*`) sur ce typage TS.
function fromBase64(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Génère un sel aléatoire (16 octets) — à créer une fois à l'activation, réutilisé pour chaque dérivation de clé tant que le code n'est pas changé. */
export function generateSalt(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(16)));
}

/** Dérive une clé AES-GCM à partir du code à 4 chiffres et du sel stocké. */
export async function deriveKey(pin: string, saltBase64: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: fromBase64(saltBase64), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Chiffre le refresh token — un nouvel IV aléatoire à chaque appel, jamais réutilisé avec la même clé (y compris pour une resynchronisation). */
export async function encryptRefreshToken(
  key: CryptoKey,
  refreshToken: string,
): Promise<{ iv: string; ciphertext: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(refreshToken),
  );
  return { iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)) };
}

/**
 * Déchiffre le refresh token. Lève une exception sur mauvais code : l'échec
 * d'authentification AES-GCM sert directement de signal « mauvais code »,
 * pas besoin d'un hash de vérification séparé.
 */
export async function decryptRefreshToken(
  key: CryptoKey,
  ivBase64: string,
  ciphertextBase64: string,
): Promise<string> {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(ivBase64) },
    key,
    fromBase64(ciphertextBase64),
  );
  return new TextDecoder().decode(plaintext);
}
