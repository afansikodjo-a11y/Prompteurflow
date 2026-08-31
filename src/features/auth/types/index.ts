/**
 * Types du domaine « auth » (session + rôle).
 */

/** Utilisateur authentifié, avec son rôle (`profiles.role`). */
export interface AuthUser {
  id: string;
  email: string;
  role: "user" | "admin";
  /** Programme d'affiliation activé pour ce compte (sur demande, par un admin). */
  isAffiliate: boolean;
  /** `profiles.created_at` — sert au grandfathering de l'accès gratuit historique (voir `useSubscription`). */
  createdAt: string;
}

export interface UseAuthResult {
  /** `null` tant que non connecté (ou pendant le chargement initial). */
  user: AuthUser | null;
  /** `true` pendant la résolution de la session initiale. */
  loading: boolean;
  signUp: (email: string, password: string, phone: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}
