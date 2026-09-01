import "server-only";

import { siteConfig } from "@/config/site";

import { PaymentUpstreamError, type InitializePaymentInput, type InitializePaymentResult } from "./payment-provider";

const PAYDUNYA_LIVE_API_URL = "https://app.paydunya.com/api/v1/checkout-invoice/create";
const PAYDUNYA_SANDBOX_API_URL = "https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create";
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Corps de requête et enveloppe de réponse vérifiés par un appel réel à
 * l'API PayDunya (clés live, 2026-09-01) : `response_code`/`response_text`/
 * `token` exactement conformes à la doc, page de paiement fonctionnelle.
 * Erreur métier (ex. montant sous le minimum PayDunya) : HTTP 200 mais
 * `response_code` différent de "00" — géré explicitement ci-dessous, ne
 * jamais se fier au seul statut HTTP pour détecter un échec côté PayDunya.
 *
 * URL sandbox vs live choisie selon le préfixe de la clé privée
 * (`test_...`) — les deux environnements PayDunya utilisent des chemins
 * d'API distincts, contrairement à Moneroo où seule la clé change.
 *
 * `store.name` envoyé mais n'a pas suffi à afficher "PrompteurFlow" comme
 * marchand sur la page de paiement (nom de l'entité enregistrée sur le
 * compte PayDunya affiché à la place) — probablement un réglage du profil
 * marchand côté dashboard PayDunya, pas quelque chose que cette requête
 * peut forcer.
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
        store: {
          name: siteConfig.name,
          website_url: siteConfig.url,
          logo_url: `${appOrigin}/apple-icon.png`,
        },
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
