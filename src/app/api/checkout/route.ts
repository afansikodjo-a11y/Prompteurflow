import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import { PaymentUpstreamError, type InitializePaymentResult } from "./lib/payment-provider";
import { getProvider, resolveEnabledProviders } from "./lib/providers";

export const runtime = "nodejs";
export const maxDuration = 30;

type BillingPeriod = "monthly" | "annual";

const PLAN_NAMES: Record<string, string> = { basic: "Découverte", pro: "Pro" };

function errorResponse(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

function validate(body: unknown): { planId: "basic" | "pro"; billingPeriod: BillingPeriod } | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;
  if (record.planId !== "basic" && record.planId !== "pro") return null;
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
    .select("price_xof, annual_price_xof, is_active")
    .eq("id", parsed.planId)
    .single();

  // `is_active` défend aussi contre un plan retiré de la vente (Standard
  // aujourd'hui, potentiellement Pro lui-même un jour) — pas seulement
  // contre un id invalide. Ne jamais se fier à la seule UI pour ça (déjà
  // le sujet d'une faille corrigée plus tôt sur /api/ai/write).
  if (!plan || !plan.is_active) {
    return errorResponse(400, "Plan introuvable.");
  }

  const amountXof = parsed.billingPeriod === "annual" ? plan.annual_price_xof : plan.price_xof;
  if (amountXof === null || amountXof === undefined) {
    return errorResponse(400, "Palier annuel indisponible pour ce plan.");
  }

  const enabledProviders = await resolveEnabledProviders(supabase);
  if (enabledProviders.length === 0) {
    console.error("Aucun fournisseur de paiement actif (payment_providers).");
    return errorResponse(503, "Aucun moyen de paiement disponible actuellement — contactez le support.");
  }

  // Dérivé de la requête elle-même plutôt que de NEXT_PUBLIC_APP_URL : une
  // variable d'environnement mal configurée/pas redéployée sur Vercel a
  // produit un return_url relatif ("/paiement/retour" au lieu d'une URL
  // absolue), rejeté par Moneroo ("The return url must be a valid URL.").
  // L'origine de la requête entrante est toujours correcte, sans dépendre
  // d'aucune variable à tenir à jour.
  const appUrl = new URL(request.url).origin;
  const periodLabel = parsed.billingPeriod === "annual" ? "annuel" : "mensuel";

  // Essaie chaque fournisseur actif dans l'ordre (PROVIDER_ORDER) jusqu'au
  // premier qui répond — une clé manquante/mal configurée ou une panne
  // amont sur le fournisseur prioritaire (ex. PayDunya) ne doit jamais
  // bloquer un client tant qu'un autre fournisseur actif (ex. Moneroo) peut
  // encore traiter le paiement. Erreur renvoyée au client seulement si tous
  // ont échoué.
  let providerId = enabledProviders[0];
  let payment: InitializePaymentResult | undefined;
  let lastError: unknown;

  for (const candidateId of enabledProviders) {
    try {
      payment = await getProvider(candidateId).initializePayment({
        amountXof,
        description: `Abonnement ${PLAN_NAMES[parsed.planId]} (${periodLabel}) — PrompteurFlow`,
        customerEmail: user.email,
        returnUrl: `${appUrl}/paiement/retour`,
        metadata: { user_id: user.id, plan_id: parsed.planId, billing_period: parsed.billingPeriod },
      });
      providerId = candidateId;
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
      const message = error instanceof PaymentUpstreamError ? error.message : String(error);
      console.error(`Échec du fournisseur ${candidateId}, repli sur le suivant si disponible :`, message);
    }
  }

  if (!payment) {
    if (lastError instanceof PaymentUpstreamError) {
      const status = lastError.status;
      return errorResponse(
        status !== undefined && status < 500 ? 500 : status !== undefined ? 502 : 503,
        status !== undefined && status < 500
          ? "Le paiement n'a pas pu être initialisé. Réessayez plus tard."
          : "Le service de paiement est momentanément indisponible. Réessayez dans quelques instants.",
      );
    }
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
    provider: providerId,
    payment_reference: payment.transactionId,
  });

  await admin.from("subscriptions").insert({
    user_id: user.id,
    plan_id: parsed.planId,
    status: "pending",
    billing_period: parsed.billingPeriod,
    provider: providerId,
    payment_reference: payment.transactionId,
  });

  return NextResponse.json({ checkoutUrl: payment.checkoutUrl });
}
