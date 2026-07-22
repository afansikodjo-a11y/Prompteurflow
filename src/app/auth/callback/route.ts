import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Point d'échange commun à tous les liens envoyés par Supabase Auth
 * (réinitialisation de mot de passe aujourd'hui, réutilisable pour de
 * futurs flux) : échange le `code` contre une vraie session (cookies posés
 * par le client serveur), puis redirige vers `next`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/studio";
  // N'accepte qu'un chemin relatif interne — `next` vient de la query string
  // (contrôlable par quiconque construit le lien) et était jusqu'ici
  // concaténé tel quel à `origin`. Une valeur comme "@evil.com/x" produit
  // "https://prompteurflow.com@evil.com/x", où "evil.com" devient le host
  // réel (syntaxe userinfo@host) : redirection ouverte exploitable dès
  // qu'un `code` valide est échangé, y compris un code obtenu par
  // l'attaquant pour son propre compte.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/studio";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
