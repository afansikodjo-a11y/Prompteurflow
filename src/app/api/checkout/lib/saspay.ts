import "server-only";

import { PaymentUpstreamError, type InitializePaymentInput, type InitializePaymentResult } from "./payment-provider";

const SASPAY_API_URL = "https://api.saspay.me/api/v1/checkout-sessions/";
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * ⚠️ Champs du body/de la réponse déduits de la doc publique
 * (https://docs.saspay.me/api-reference/payments), pas d'une spec OpenAPI
 * (inaccessible, 404 sur /openapi.json) ni d'un appel réel — SasPay n'a
 * jamais été testé avec de vraies clés au moment d'écrire ceci. Forme REST
 * standard par analogie avec Moneroo. À vérifier/ajuster dès les premières
 * clés `sk_test_...` disponibles (voir aussi le seed `enabled = false` sur
 * `payment_providers` dans 0018 — ce fournisseur reste désactivé tant que
 * ça n'a pas été fait).
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
        customer: { email: input.customerEmail },
        redirect_url: input.returnUrl,
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

  const data = await response.json();
  // Repli sur `data.data.*` (forme enveloppée, comme Moneroo) si la forme à
  // plat (`data.id`/`data.checkout_url`) ne matche pas — la doc ne tranche
  // pas clairement laquelle des deux formes SasPay utilise réellement.
  const transactionId = data?.id ?? data?.data?.id;
  const checkoutUrl = data?.checkout_url ?? data?.data?.checkout_url;
  if (typeof transactionId !== "string" || typeof checkoutUrl !== "string") {
    throw new PaymentUpstreamError("Réponse SasPay inattendue (id/checkout_url manquants).");
  }

  return { transactionId, checkoutUrl };
}
