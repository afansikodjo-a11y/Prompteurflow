import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PERIOD_DAYS: Record<string, number> = { monthly: 30, annual: 365 };

function errorResponse(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/**
 * Active le plan Pro pour un client sans passer par Moneroo (offert par
 * l'admin) — aucune ligne `transactions` créée, pour ne pas fausser les
 * métriques de revenu (sourcées uniquement de `transactions.status =
 * 'succeeded'`). Neutralise d'abord tout abonnement `active` existant :
 * `useSubscription()` interroge `status = 'active'` avec `.maybeSingle()`,
 * qui échoue si plusieurs lignes actives coexistent pour le même
 * utilisateur.
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
  const billingPeriod = record.billingPeriod === "annual" || record.billingPeriod === "monthly" ? record.billingPeriod : null;
  if (!targetUserId || !billingPeriod) return errorResponse(400, "Requête invalide.");

  const admin = createAdminClient();

  const { error: supersedeError } = await admin
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("user_id", targetUserId)
    .eq("status", "active");
  if (supersedeError) {
    console.error("Échec de neutralisation des abonnements actifs existants :", supersedeError);
    return errorResponse(500, "Impossible d'activer le plan Pro.");
  }

  const days = PERIOD_DAYS[billingPeriod] ?? 30;
  const currentPeriodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const { error: insertError } = await admin.from("subscriptions").insert({
    user_id: targetUserId,
    plan_id: "pro",
    status: "active",
    billing_period: billingPeriod,
    current_period_end: currentPeriodEnd,
  });
  if (insertError) {
    console.error("Échec d'activation Pro admin :", insertError);
    return errorResponse(500, "Impossible d'activer le plan Pro.");
  }

  return NextResponse.json({ ok: true });
}
