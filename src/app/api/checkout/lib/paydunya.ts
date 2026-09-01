import "server-only";

import { siteConfig } from "@/config/site";

import { PaymentUpstreamError, type InitializePaymentInput, type InitializePaymentResult } from "./payment-provider";

const PAYDUNYA_LIVE_API_URL = "https://app.paydunya.com/api/v1/checkout-invoice/create";
const PAYDUNYA_SANDBOX_API_URL = "https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create";
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * ⚠️ Corps de requête et enveloppe de réponse déduits de la doc publique et
 * du SDK officiel (developers.paydunya.com/doc/FR/http_json,
 * github.com/paydunyadev/paydunya-php) — pas encore vérifiés par un appel
 * réel avec de vraies clés (contrairement à `moneroo.ts`, et à `saspay.ts`
 * en son temps une fois corrigé). À confirmer dès les premières clés
 * `PAYDUNYA_*_KEY` disponibles, avant d'activer ce fournisseur dans
 * `payment_providers` (désactivé par défaut, voir migration 0019).
 *
 * URL sandbox vs live choisie selon le préfixe de la clé privée
 * (`test_...`) — les deux environnements PayDunya utilisent des chemins
 * d'API distincts, contrairement à Moneroo/SasPay où seule la clé change.
 */
export async function initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult> {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
  const token = process.env.PAYDUNYA_TOKEN;
  if (!masterKey || !privateKey || !token) {
    throw new PaymentUpstreamError("Clés PAYDUNYA_* manquantes côté serveur.");
  }

  const apiUrl = privateKey.startsWith("test_") ? PAYDUNYA_SANDBOX_API_URL : PAYDUNYA_LIVE_API_URL;
  const appOrigin = new URL(input.returnUrl).origin;

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "PAYDUNYA-MASTER-KEY": masterKey,
        "PAYDUNYA-PRIVATE-KEY": privateKey,
        "PAYDUNYA-TOKEN": token,
      },
      body: JSON.stringify({
        invoice: {
          total_amount: input.amountXof,
          description: input.description,
          customer: { email: input.customerEmail },
        },
        store: { name: siteConfig.name },
        actions: {
          return_url: input.returnUrl,
          cancel_url: input.returnUrl,
          callback_url: `${appOrigin}/api/webhooks/paydunya`,
        },
        custom_data: input.metadata,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new PaymentUpstreamError(error instanceof Error ? error.message : "Erreur réseau vers PayDunya.");
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new PaymentUpstreamError(`PayDunya a répondu ${response.status} : ${bodyText}`, response.status);
  }

  const body = await response.json();
  // Doc/SDK concordants sur ce point : succès = response_code "00",
  // response_text contient directement l'URL de paiement (pas un champ
  // dédié type checkout_url), token = référence de la facture.
  if (body?.response_code !== "00") {
    throw new PaymentUpstreamError(`PayDunya : ${body?.response_text ?? "réponse inattendue"}`, response.status);
  }
  const checkoutUrl = body?.response_text;
  const transactionId = body?.token;
  if (typeof transactionId !== "string" || typeof checkoutUrl !== "string") {
    throw new PaymentUpstreamError("Réponse PayDunya inattendue (token/response_text manquants).");
  }

  return { transactionId, checkoutUrl };
}
