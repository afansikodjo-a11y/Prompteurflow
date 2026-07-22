import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function errorResponse(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/**
 * Confirme manuellement l'email d'un compte (API Admin Supabase Auth) — pour
 * un client qui n'a jamais reçu/retrouvé son email de confirmation. N'a
 * aucun effet sur `profiles` : la confirmation d'email vit uniquement dans
 * `auth.users`, gérée par Supabase, jamais dupliquée dans notre schéma.
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

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(targetUserId, { email_confirm: true });
  if (error) {
    console.error("Échec de confirmation d'email :", error);
    return errorResponse(500, "Impossible de confirmer cet email.");
  }

  return NextResponse.json({ ok: true });
}
