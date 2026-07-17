import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase serveur — pour les Server Components et Route Handlers.
 * Lit/écrit les cookies de session de la requête courante (RLS appliquée
 * selon l'utilisateur authentifié, à la différence du client admin).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Appelé depuis un Server Component : sans effet si le
            // middleware rafraîchit déjà la session (cookies figés ici).
          }
        },
      },
    },
  );
}
