import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function errorResponse(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/**
 * Supprime réellement un compte client — contrairement à `status/route.ts`
 * (désactivation, jamais une suppression), sur demande explicite pour un
 * compte déjà désactivé. Nettoie d'abord les lignes dépendantes sans
 * cascade (`admin_delete_customer_dependents`, 0017) avant de supprimer le
 * compte Auth, qui cascade ensuite vers `profiles`/`ai_generations`.
 * Irréversible : supprime aussi l'historique de paiement/commissions de ce
 * client (choix produit assumé, voir la migration).
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

  const targetUserId = typeof (body as Record<string, unknown>).userId === "string"
    ? (body as Record<string, unknown>).userId as string
    : null;
  if (!targetUserId) return errorResponse(400, "Requête invalide.");

  if (targetUserId === user.id) {
    return errorResponse(400, "Impossible de supprimer votre propre compte.");
  }

  const admin = createAdminClient();

  // Garde-fou serveur : ne supprime jamais un compte encore actif, même si
  // l'appel contourne l'UI (qui ne propose le bouton que pour un compte déjà
  // désactivé).
  const { data: target } = await admin.from("profiles").select("disabled_at").eq("id", targetUserId).single();
  if (!target) return errorResponse(404, "Compte introuvable.");
  if (target.disabled_at === null) {
    return errorResponse(400, "Désactivez d'abord ce compte avant de le supprimer.");
  }

  const { error: dependentsError } = await admin.rpc("admin_delete_customer_dependents", { target_id: targetUserId });
  if (dependentsError) {
    console.error("Échec de nettoyage des lignes dépendantes avant suppression :", dependentsError);
    return errorResponse(500, "Impossible de supprimer ce compte.");
  }

  const { error: authError } = await admin.auth.admin.deleteUser(targetUserId);
  if (authError) {
    console.error("Échec de suppression du compte Auth :", authError);
    return errorResponse(500, "Lignes dépendantes supprimées mais le compte lui-même n'a pas pu l'être — réessayez.");
  }

  return NextResponse.json({ ok: true });
}
