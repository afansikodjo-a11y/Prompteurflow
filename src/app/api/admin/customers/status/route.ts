import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Bannissement "permanent" côté Supabase Auth — il n'existe pas de valeur
// littérale "forever" dans leur API, une très longue durée est la
// convention documentée pour un blocage indéfini.
const PERMANENT_BAN_DURATION = "876000h";

function errorResponse(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/**
 * Active/désactive un compte client — jamais une suppression réelle
 * (profils/abonnements/transactions/commissions d'affiliation restent
 * intacts, RGPD/comptabilité mis à part cette route ne les touche pas).
 * Bloque réellement la connexion via l'API Admin Supabase Auth
 * (auth.admin.updateUserById), en plus de `profiles.disabled_at` posé pour
 * l'affichage — les deux vont toujours de pair, jamais l'un sans l'autre.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return errorResponse(401, "Non authentifié.");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return errorResponse(403, "Accès réservé aux admins.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "Requête invalide.");
  }

  const record = body as Record<string, unknown>;
  const targetUserId = typeof record.userId === "string" ? record.userId : null;
  const disabled = typeof record.disabled === "boolean" ? record.disabled : null;
  if (!targetUserId || disabled === null) {
    return errorResponse(400, "Requête invalide.");
  }

  if (targetUserId === user.id) {
    return errorResponse(400, "Impossible de désactiver votre propre compte.");
  }

  const admin = createAdminClient();

  const { error: authError } = await admin.auth.admin.updateUserById(targetUserId, {
    ban_duration: disabled ? PERMANENT_BAN_DURATION : "none",
  });
  if (authError) {
    console.error("Échec de bannissement Supabase Auth :", authError);
    return errorResponse(500, "Impossible de modifier le statut du compte.");
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ disabled_at: disabled ? new Date().toISOString() : null })
    .eq("id", targetUserId);
  if (profileError) {
    console.error("Échec de mise à jour profiles.disabled_at :", profileError);
    return errorResponse(500, "Statut Auth modifié mais profil non synchronisé — réessayez.");
  }

  return NextResponse.json({ ok: true });
}
