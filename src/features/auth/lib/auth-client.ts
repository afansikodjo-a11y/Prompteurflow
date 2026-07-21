import { getReferralCodeFromCookie } from "@/features/affiliate/lib/referral-cookie";
import { createClient } from "@/lib/supabase/client";

/** Traduit les messages d'erreur Supabase Auth les plus courants en français. */
function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (message.includes("already registered") || message.includes("User already registered")) {
    return "Un compte existe déjà avec cet email.";
  }
  if (message.includes("Password should be at least")) return "Le mot de passe est trop court.";
  return "Une erreur est survenue. Réessayez.";
}

/**
 * Crée un compte (email + mot de passe). Transmet le code de parrainage
 * (posé en cookie par `middleware.ts` depuis `?ref=`) via `options.data` —
 * seul canal permettant à `handle_new_user()` (trigger Postgres) de le lire
 * ensuite via `raw_user_meta_data`. Code absent : signup normal, inchangé.
 */
export async function signUp(email: string, password: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const referralCode = getReferralCodeFromCookie();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: referralCode ? { data: { referral_code: referralCode } } : undefined,
  });
  return { error: error ? translateAuthError(error.message) : null };
}

/** Connecte un compte existant. */
export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error ? translateAuthError(error.message) : null };
}

/** Déconnecte l'utilisateur courant. */
export async function signOut(): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error: error ? translateAuthError(error.message) : null };
}
