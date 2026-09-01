import "server-only";

import { PaymentUpstreamError, type InitializePaymentInput, type InitializePaymentResult } from "./payment-provider";

const SASPAY_API_URL = "https://api.saspay.me/api/v1/checkout-sessions/";
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Dérive un nom pragmatique pour SasPay (`customer_name` obligatoire) —
 * aucun nom n'est collecté nulle part dans l'app aujourd'hui (signup =
 * email + mot de passe seulement). Même raisonnement que
 * `customerNameFromEmail` dans `moneroo.ts`, mais SasPay veut un nom unique
 * plutôt que prénom/nom séparés.
 */
function customerNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] || "Client";
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

/**
 * Corps de requête et enveloppe de réponse vérifiés par un appel réel à
 * l'API SasPay (clé `sk_test_...`, 2026-09-01) — pas seulement déduits de
 * la doc publique, qui ne les précisait pas explicitement :
 * - `customer_email`/`customer_name` à plat (pas `customer: {...}` imbriqué).
 * - `return_url` (pas `redirect_url` — testé, silencieusement ignoré par
 *   l'API sans erreur, mais jamais répercuté : le client ne serait jamais
 *   redirigé vers l'app après paiement).
 * - Réponse enveloppée dans `data` (`{ success, data: { id, checkout_url,
 *   ... }, code }`), jamais à plat.
 */
export async function initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult> {
  const apiKey = process.env.SASPAY_SECRET_KEY;
  if (!apiKey) {
    throw new PaymentUpstreamError("SASPAY_SECRET_KEY manquante côté serveur.");
  }

  let response: Response;
  try {
    response = await fetch(SASPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount: input.amountXof,
        currency: "XOF",
        description: input.description,
        customer_email: input.customerEmail,
        customer_name: customerNameFromEmail(input.customerEmail),
        return_url: input.returnUrl,
        metadata: input.metadata,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new PaymentUpstreamError(error instanceof Error ? error.message : "Erreur réseau vers SasPay.");
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new PaymentUpstreamError(`SasPay a répondu ${response.status} : ${bodyText}`, response.status);
  }

  const body = await response.json();
  const transactionId = body?.data?.id;
  const checkoutUrl = body?.data?.checkout_url;
  if (typeof transactionId !== "string" || typeof checkoutUrl !== "string") {
    throw new PaymentUpstreamError("Réponse SasPay inattendue (id/checkout_url manquants).");
  }

  return { transactionId, checkoutUrl };
}
