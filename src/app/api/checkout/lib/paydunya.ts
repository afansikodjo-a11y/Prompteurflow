import "server-only";

import { siteConfig } from "@/config/site";

import { PaymentUpstreamError, type InitializePaymentInput, type InitializePaymentResult } from "./payment-provider";

const BASE_URL = "https://app.paydunya.com";
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * `PAYDUNYA_MODE` explicite (`live` par défaut, `test` pour la sandbox) —
 * plus fiable qu'une inférence sur le préfixe de la clé privée (approche
 * abandonnée : rien ne garantit que PayDunya préfixe toujours ses clés
 * `test_`/`live_`). Retour d'expérience d'une intégration PayDunya
 * antérieure (payin + payout, Edossimé) — voir aussi le webhook.
 */
const MODE = (process.env.PAYDUNYA_MODE ?? "live").toLowerCase() === "test" ? "test" : "live";
export const PAYDUNYA_API_V1 = MODE === "test" ? `${BASE_URL}/sandbox-api/v1` : `${BASE_URL}/api/v1`;

/** Exporté pour réutilisation par `paydunya-softpay.ts` — mêmes 4 clés pour tous les endpoints PayDunya. */
export function paydunyaAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY ?? "",
    "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY ?? "",
    "PAYDUNYA-PUBLIC-KEY": process.env.PAYDUNYA_PUBLIC_KEY ?? "",
    "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN ?? "",
  };
}

/**
 * Dérive un nom pragmatique pour PayDunya (`customer_name`/`customer_email`
 * obligatoires — vérifié par un appel réel : leur absence renvoie "Ce champ
 * est obligatoire") — aucun nom n'est collecté nulle part dans l'app
 * aujourd'hui (signup = email + mot de passe seulement).
 */
function customerNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] || "Client";
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

/**
 * Crée une facture de paiement (checkout hébergé) — `response_code`/
 * `response_text`/`token` vérifiés par un appel réel (2026-09-01) :
 * succès = "00", `response_text` contient directement l'URL de paiement,
 * `token` = référence à stocker (`payment_reference`) pour mapper le
 * webhook et `confirmCheckoutInvoice` ensuite.
 */
export async function initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult> {
  const { PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_PUBLIC_KEY, PAYDUNYA_TOKEN } = process.env;
  if (!PAYDUNYA_MASTER_KEY || !PAYDUNYA_PRIVATE_KEY || !PAYDUNYA_PUBLIC_KEY || !PAYDUNYA_TOKEN) {
    throw new PaymentUpstreamError("Clés PAYDUNYA_* manquantes côté serveur.");
  }

  const appOrigin = new URL(input.returnUrl).origin;

  let response: Response;
  try {
    response = await fetch(`${PAYDUNYA_API_V1}/checkout-invoice/create`, {
      method: "POST",
      headers: paydunyaAuthHeaders(),
      body: JSON.stringify({
        invoice: {
          total_amount: Math.round(input.amountXof),
          description: input.description,
          customer_email: input.customerEmail,
          customer_name: customerNameFromEmail(input.customerEmail),
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

  const body = await response.json().catch(() => null);
  // Erreur métier possible même en HTTP 200 (ex. montant sous le minimum) :
  // ne jamais se fier au seul statut HTTP, toujours vérifier response_code.
  if (String(body?.response_code) !== "00" || typeof body?.token !== "string") {
    throw new PaymentUpstreamError(`PayDunya : ${body?.response_text ?? "réponse inattendue"}`, response.status);
  }

  const token = String(body.token);
  const checkoutUrl =
    typeof body.response_text === "string" && body.response_text.startsWith("http")
      ? body.response_text
      : `${BASE_URL}/checkout/invoice/${token}`;

  return { transactionId: token, checkoutUrl };
}

export interface ConfirmedInvoice {
  /** `"completed" | "cancelled" | "pending"` côté PayDunya. */
  status: string;
  amountXof: number;
  customData: Record<string, unknown>;
}

/**
 * Re-confirme le statut réel d'une facture directement auprès de PayDunya —
 * l'autorité sur un paiement est cette API, jamais le seul webhook (IPN).
 * Appelée depuis `webhooks/paydunya/route.ts` avant de créditer quoi que ce
 * soit, même une fois la signature du webhook validée.
 */
export async function confirmCheckoutInvoice(token: string): Promise<ConfirmedInvoice | null> {
  const { PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_PUBLIC_KEY, PAYDUNYA_TOKEN } = process.env;
  if (!PAYDUNYA_MASTER_KEY || !PAYDUNYA_PRIVATE_KEY || !PAYDUNYA_PUBLIC_KEY || !PAYDUNYA_TOKEN) return null;

  let response: Response;
  try {
    response = await fetch(`${PAYDUNYA_API_V1}/checkout-invoice/confirm/${token}`, {
      headers: paydunyaAuthHeaders(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;

  const body = await response.json().catch(() => null);
  if (String(body?.response_code) !== "00") return null;

  return {
    status: String(body?.status ?? ""),
    amountXof: Number(body?.invoice?.total_amount ?? 0),
    customData: (body?.custom_data ?? {}) as Record<string, unknown>,
  };
}
