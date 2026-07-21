import "server-only";

const MONEROO_API_URL = "https://api.moneroo.io/v1/payments/initialize";
const REQUEST_TIMEOUT_MS = 30_000;

export class MonerooUpstreamError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "MonerooUpstreamError";
    this.status = status;
  }
}

export interface InitializePaymentInput {
  amountXof: number;
  description: string;
  customerEmail: string;
  returnUrl: string;
  metadata: Record<string, string>;
}

export interface InitializePaymentResult {
  transactionId: string;
  checkoutUrl: string;
}

/**
 * Dérive un prénom/nom pragmatique pour Moneroo (champs obligatoires) —
 * aucun nom n'est collecté nulle part dans l'app aujourd'hui (signup =
 * email + mot de passe seulement). À revoir si un vrai formulaire de nom
 * est ajouté plus tard.
 */
function customerNameFromEmail(email: string): { firstName: string; lastName: string } {
  const localPart = email.split("@")[0] || "Client";
  const firstName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
  return { firstName, lastName: "Client" };
}

export async function initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult> {
  const apiKey = process.env.MONEROO_SECRET_KEY;
  if (!apiKey) {
    throw new MonerooUpstreamError("MONEROO_SECRET_KEY manquante côté serveur.");
  }

  const { firstName, lastName } = customerNameFromEmail(input.customerEmail);

  let response: Response;
  try {
    response = await fetch(MONEROO_API_URL, {
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
        customer: { email: input.customerEmail, first_name: firstName, last_name: lastName },
        return_url: input.returnUrl,
        metadata: input.metadata,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new MonerooUpstreamError(error instanceof Error ? error.message : "Erreur réseau vers Moneroo.");
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new MonerooUpstreamError(`Moneroo a répondu ${response.status} : ${bodyText}`, response.status);
  }

  const data = await response.json();
  const transactionId = data?.data?.id;
  const checkoutUrl = data?.data?.checkout_url;
  if (typeof transactionId !== "string" || typeof checkoutUrl !== "string") {
    throw new MonerooUpstreamError("Réponse Moneroo inattendue (id/checkout_url manquants).");
  }

  return { transactionId, checkoutUrl };
}
