import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import { initializePayment } from "../lib/paydunya";
import { softpayCharge, SOFTPAY_OPERATORS, type SoftpayOperatorId } from "../lib/paydunya-softpay";
import { PaymentUpstreamError } from "../lib/payment-provider";

export const runtime = "nodejs";
export const maxDuration = 30;

type BillingPeriod = "monthly" | "annual";

const PLAN_NAMES: Record<string, string> = { basic: "Découverte", pro: "Pro" };

function errorResponse(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

interface ValidatedBody {
  planId: "basic" | "pro";
  billingPeriod: BillingPeriod;
  operator: SoftpayOperatorId;
  fullName: string;
  phone: string;
  otp?: string;
}

function validate(body: unknown): ValidatedBody | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;
  if (record.planId !== "basic" && record.planId !== "pro") return null;
  if (record.billingPeriod !== "monthly" && record.billingPeriod !== "annual") return null;
  if (typeof record.operator !== "string" || !(record.operator in SOFTPAY_OPERATORS)) return null;
  if (typeof record.fullName !== "string" || !record.fullName.trim()) return null;
  if (typeof record.phone !== "string" || !record.phone.trim()) return null;
  const otp = typeof record.otp === "string" && record.otp.trim() ? record.otp.trim() : undefined;
  return {
    planId: record.planId,
    billingPeriod: record.billingPeriod,
    operator: record.operator as SoftpayOperatorId,
    fullName: record.fullName.trim(),
    phone: record.phone.trim(),
    otp,
  };
}

/**
 * Variante SoftPay du checkout : paiement mobile money collecté sur notre
 * page plutôt qu'une redirection vers PayDunya. Spécifique à PayDunya (pas
 * de repli Moneroo ici — `PricingCards` ne propose ce flux que si PayDunya
 * est actif, sinon garde l'ancien lien de redirection classique).
 *
 * La facture reste valide même si le softpay échoue ensuite (mauvais
 * numéro, opérateur down...) : jamais d'erreur générique, le message de
 * PayDunya remonte tel quel pour que le client puisse réessayer sans
 * repayer une facture.
 */
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
    return errorResponse(400, "Requête invalide — vérifiez les informations saisies.");
  }

  const { data: plan } = await supabase
    .from("plans")
    .select("price_xof, annual_price_xof, is_active")
    .eq("id", parsed.planId)
    .single();

  if (!plan || !plan.is_active) {
    return errorResponse(400, "Plan introuvable.");
  }

  const amountXof = parsed.billingPeriod === "annual" ? plan.annual_price_xof : plan.price_xof;
  if (amountXof === null || amountXof === undefined) {
    return errorResponse(400, "Palier annuel indisponible pour ce plan.");
  }

  const appUrl = new URL(request.url).origin;
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
    const message = error instanceof PaymentUpstreamError ? error.message : String(error);
    console.error("Échec de création de facture PayDunya (softpay) :", message);
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
    provider: "paydunya",
    payment_reference: payment.transactionId,
  });

  await admin.from("subscriptions").insert({
    user_id: user.id,
    plan_id: parsed.planId,
    status: "pending",
    billing_period: parsed.billingPeriod,
    provider: "paydunya",
    payment_reference: payment.transactionId,
  });

  const charge = await softpayCharge({
    operator: parsed.operator,
    invoiceToken: payment.transactionId,
    fullName: parsed.fullName,
    email: user.email,
    phone: parsed.phone,
    otp: parsed.otp,
  });

  if (charge.status === "error") {
    return NextResponse.json({ status: "error", message: charge.message }, { status: 400 });
  }
  if (charge.status === "redirect") {
    return NextResponse.json({ status: "redirect", url: charge.url });
  }
  return NextResponse.json({ status: "pending", message: charge.message });
}
