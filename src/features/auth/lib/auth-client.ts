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
 * Crée un compte (email + mot de passe + téléphone WhatsApp). Transmet le
 * téléphone et le code de parrainage (posé en cookie par `middleware.ts`
 * depuis `?ref=`) via `options.data` — seul canal permettant à
 * `handle_new_user()` (trigger Postgres) de les lire ensuite via
 * `raw_user_meta_data`.
 */
export async function signUp(
  email: string,
  password: string,
  phone: string,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const referralCode = getReferralCodeFromCookie();
  const data: Record<string, string> = { phone };
  if (referralCode) data.referral_code = referralCode;
  const { error } = await supabase.auth.signUp({ email, password, options: { data } });
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

/**
 * Envoie un email de réinitialisation de mot de passe — Supabase ne
 * confirme jamais si l'email existe ou non (le message affiché côté UI
 * reste volontairement générique, même principe côté serveur).
 */
export async function resetPasswordForEmail(email: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/reinitialiser-mot-de-passe`,
  });
  return { error: error ? translateAuthError(error.message) : null };
}

/**
 * Met à jour le mot de passe de la session courante — n'a d'effet que
 * juste après avoir suivi un lien de réinitialisation (session temporaire
 * établie par `/auth/callback`), pas un changement de mot de passe
 * "classique" depuis un compte déjà connecté (pas construit ici).
 */
export async function updatePassword(password: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error ? translateAuthError(error.message) : null };
}
