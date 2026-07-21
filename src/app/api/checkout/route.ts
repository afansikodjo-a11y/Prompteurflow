import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import { initializePayment, MonerooUpstreamError } from "./lib/moneroo";

export const runtime = "nodejs";
export const maxDuration = 30;

type BillingPeriod = "monthly" | "annual";

const PLAN_NAMES: Record<string, string> = { standard: "Standard", pro: "Pro" };

function errorResponse(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

function validate(body: unknown): { planId: "standard" | "pro"; billingPeriod: BillingPeriod } | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;
  if (record.planId !== "standard" && record.planId !== "pro") return null;
  if (record.billingPeriod !== "monthly" && record.billingPeriod !== "annual") return null;
  return { planId: record.planId, billingPeriod: record.billingPeriod };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return errorResponse(401, "Connectez-vous pour vous abonner.");
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return errorResponse(400, "Requête invalide.");
  }

  const parsed = validate(rawBody);
  if (!parsed) {
    return errorResponse(400, "Requête invalide — vérifiez le plan et la période sélectionnés.");
  }

  const { data: plan } = await supabase
    .from("plans")
    .select("price_xof, annual_price_xof")
    .eq("id", parsed.planId)
    .single();

  if (!plan) {
    return errorResponse(400, "Plan introuvable.");
  }

  const amountXof = parsed.billingPeriod === "annual" ? plan.annual_price_xof : plan.price_xof;
  if (amountXof === null || amountXof === undefined) {
    return errorResponse(400, "Palier annuel indisponible pour ce plan.");
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const periodLabel = parsed.billingPeriod === "annual" ? "annuel" : "mensuel";

  let payment;
  try {
    payment = await initializePayment({
      amountXof,
      description: `Abonnement ${PLAN_NAMES[parsed.planId]} (${periodLabel}) — PrompteurFlow`,
      customerEmail: user.email,
      returnUrl: `${appUrl}/paiement/retour`,
      metadata: { user_id: user.id, plan_id: parsed.planId, billing_period: parsed.billingPeriod },
    });
  } catch (error) {
    if (error instanceof MonerooUpstreamError) {
      if (error.status !== undefined && error.status >= 400 && error.status < 500) {
        console.error("Erreur Moneroo (clé/requête) :", error.message);
        return errorResponse(500, "Le paiement n'a pas pu être initialisé. Réessayez plus tard.");
      }
      console.error("Erreur Moneroo (upstream) :", error.message);
      return errorResponse(error.status !== undefined ? 502 : 503, "Le service de paiement est momentanément indisponible. Réessayez dans quelques instants.");
    }
    console.error("Échec inattendu de l'appel Moneroo :", error);
    return errorResponse(503, "Le service de paiement est momentanément indisponible. Réessayez dans quelques instants.");
  }

  // transactions/subscriptions n'ont aucun grant client (service-role
  // uniquement, par design) — le client admin est indispensable ici.
  const admin = createAdminClient();

  await admin.from("transactions").insert({
    user_id: user.id,
    plan_id: parsed.planId,
    amount_xof: amountXof,
    status: "pending",
    moneroo_payment_reference: payment.transactionId,
  });

  await admin.from("subscriptions").insert({
    user_id: user.id,
    plan_id: parsed.planId,
    status: "pending",
    billing_period: parsed.billingPeriod,
    moneroo_payment_reference: payment.transactionId,
  });

  return NextResponse.json({ checkoutUrl: payment.checkoutUrl });
}
