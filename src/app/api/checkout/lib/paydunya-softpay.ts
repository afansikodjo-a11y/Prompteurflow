import "server-only";

import { PAYDUNYA_API_V1, paydunyaAuthHeaders } from "./paydunya";

const REQUEST_TIMEOUT_MS = 30_000;

/**
 * ⚠️ Chaque opérateur PayDunya a des noms de champs ARBITRAIRES (aucune
 * convention) — reproduits ici tels quels depuis la doc officielle SoftPay
 * (section T-MONEY TOGO / MOOV TOGO), pas dérivés d'un pattern. Les deux
 * confirmés par la doc, y compris `moov_togo_customer_address` pour Moov —
 * absent d'une première tentative sourcée par recherche web, qui aurait
 * échoué à l'usage. Ni l'un ni l'autre n'a de champ OTP (paiement
 * push/SMS, l'utilisateur valide sur son téléphone).
 */
export const SOFTPAY_OPERATORS = {
  "t-money-togo": {
    slug: "t-money-togo",
    label: "T-Money",
    dialCode: "228",
    fields: { name: "name_t_money", email: "email_t_money", phone: "phone_t_money", token: "payment_token" },
  },
  "moov-togo": {
    slug: "moov-togo",
    label: "Moov Money / Mixx",
    dialCode: "228",
    fields: {
      name: "moov_togo_customer_fullname",
      email: "moov_togo_email",
      phone: "moov_togo_phone_number",
      token: "payment_token",
      // Champ obligatoire côté PayDunya mais non collecté dans notre
      // formulaire (pas de vraie utilité produit identifiée — semble
      // seulement enregistré côté PayDunya) : valeur par défaut envoyée
      // telle quelle, à ajuster si un vrai test révèle une contrainte de
      // format particulière.
      address: "moov_togo_customer_address",
    },
  },
} as const;

const DEFAULT_ADDRESS = "Togo";

export type SoftpayOperatorId = keyof typeof SOFTPAY_OPERATORS;

export interface SoftpayChargeInput {
  operator: SoftpayOperatorId;
  invoiceToken: string;
  fullName: string;
  email: string;
  phone: string;
  otp?: string;
}

export type SoftpayChargeResult =
  | { status: "success" | "pending"; message: string }
  | { status: "redirect"; url: string }
  | { status: "error"; message: string };

/**
 * Charge une facture déjà créée (`checkout-invoice/create`) via l'opérateur
 * mobile money choisi — la facture reste valide même en cas d'échec ici,
 * l'appelant peut réessayer avec un autre numéro/opérateur sans repayer.
 */
export async function softpayCharge(input: SoftpayChargeInput): Promise<SoftpayChargeResult> {
  const operator = SOFTPAY_OPERATORS[input.operator];
  const fields: Record<string, string | undefined> = operator.fields;

  const payload: Record<string, string> = {
    [fields.name!]: input.fullName,
    [fields.email!]: input.email,
    [fields.phone!]: input.phone,
    [fields.token!]: input.invoiceToken,
  };
  if (fields.address) payload[fields.address] = DEFAULT_ADDRESS;
  if ("otpField" in operator && operator.otpField && input.otp) {
    payload[operator.otpField as string] = input.otp;
  }

  let response: Response;
  try {
    response = await fetch(`${PAYDUNYA_API_V1}/softpay/${operator.slug}`, {
      method: "POST",
      headers: paydunyaAuthHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Erreur réseau vers PayDunya." };
  }

  const body = await response.json().catch(() => null);

  if (!response.ok || body?.success === false) {
    return { status: "error", message: body?.message ?? body?.response_text ?? "Paiement refusé." };
  }

  const redirectUrl = body?.url ?? body?.redirect_url;
  if (typeof redirectUrl === "string" && redirectUrl.startsWith("http")) {
    return { status: "redirect", url: redirectUrl };
  }

  return { status: "pending", message: body?.message ?? "Validez le paiement sur votre téléphone." };
}
