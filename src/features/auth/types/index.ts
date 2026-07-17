/**
 * Types du domaine « auth » (session + rôle).
 */

/** Utilisateur authentifié, avec son rôle (`profiles.role`). */
export interface AuthUser {
  id: string;
  email: string;
  role: "user" | "admin";
}

export interface UseAuthResult {
  /** `null` tant que non connecté (ou pendant le chargement initial). */
  user: AuthUser | null;
  /** `true` pendant la résolution de la session initiale. */
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}
