import "server-only";

import { PAYDUNYA_API_V1, paydunyaAuthHeaders } from "./paydunya";

const REQUEST_TIMEOUT_MS = 30_000;

export type SoftpayFlow = "push" | "otp-upfront" | "redirect";

interface SoftpayOperatorFields {
  name: string;
  email: string;
  phone: string;
  token: string;
  /** Uniquement Moov Togo/Mali, Orange Money Mali — champ obligatoire côté PayDunya, pas collecté dans le formulaire (voir `DEFAULT_ADDRESS`). */
  address?: string;
  /** Uniquement Orange Money CI/Burkina — OTP obtenu par l'utilisateur via USSD avant soumission. */
  otp?: string;
}

interface SoftpayOperatorConfig {
  /** Segment d'URL PayDunya — peut être partagé par plusieurs entrées (ex. Djamo SN/CI, distingués par `extra.code_country`). */
  slug: string;
  flow: SoftpayFlow;
  fields: SoftpayOperatorFields;
  /** Champs fixes en plus du formulaire (ex. `wallet_provider`, `code_country`). */
  extra?: Record<string, string>;
}

/**
 * ⚠️ Chaque opérateur PayDunya a des noms de champs ARBITRAIRES (aucune
 * convention) — reproduits ici tels quels depuis la doc officielle SoftPay
 * complète (fournie par l'utilisateur), jamais dérivés d'un pattern.
 * Exclus volontairement : carte bancaire (certification PCI-DSS requise,
 * activation sur demande — pas acquise) et le wallet PayDunya lui-même
 * (`softpay/paydunya`, paiement par solde PayDunya — pas notre clientèle).
 * Wizall Sénégal est aussi exclu d'ici : seul opérateur du catalogue en
 * deux appels (charge → code SMS → confirmation séparée), traité par
 * `wizallInitiate`/`wizallConfirm` ci-dessous plutôt que par
 * `softpayCharge`, pour ne pas complexifier le cas commun.
 */
export const SOFTPAY_OPERATORS: Record<string, SoftpayOperatorConfig> = {
  "t-money-togo": {
    slug: "t-money-togo",
    flow: "push",
    fields: { name: "name_t_money", email: "email_t_money", phone: "phone_t_money", token: "payment_token" },
  },
  "moov-togo": {
    slug: "moov-togo",
    flow: "push",
    fields: {
      name: "moov_togo_customer_fullname",
      email: "moov_togo_email",
      phone: "moov_togo_phone_number",
      token: "payment_token",
      address: "moov_togo_customer_address",
    },
  },
  "orange-money-sn": {
    slug: "new-orange-money-senegal",
    flow: "redirect",
    fields: { name: "customer_name", email: "customer_email", phone: "phone_number", token: "invoice_token" },
  },
  "free-money-sn": {
    slug: "free-money-senegal",
    flow: "push",
    fields: { name: "customer_name", email: "customer_email", phone: "phone_number", token: "payment_token" },
  },
  "expresso-sn": {
    slug: "expresso-senegal",
    flow: "push",
    fields: { name: "expresso_sn_fullName", email: "expresso_sn_email", phone: "expresso_sn_phone", token: "payment_token" },
  },
  "wave-sn": {
    slug: "wave-senegal",
    flow: "redirect",
    fields: {
      name: "wave_senegal_fullName",
      email: "wave_senegal_email",
      phone: "wave_senegal_phone",
      token: "wave_senegal_payment_token",
    },
  },
  "djamo-sn": {
    slug: "djamo",
    flow: "redirect",
    fields: { name: "djamo_fullName", email: "djamo_email", phone: "djamo_phone", token: "djamo_payment_token" },
    extra: { code_country: "sn" },
  },
  "orange-money-ci": {
    slug: "orange-money-ci",
    flow: "otp-upfront",
    fields: {
      name: "orange_money_ci_customer_fullname",
      email: "orange_money_ci_email",
      phone: "orange_money_ci_phone_number",
      token: "payment_token",
      otp: "orange_money_ci_otp",
    },
  },
  "mtn-ci": {
    slug: "mtn-ci",
    flow: "push",
    fields: { name: "mtn_ci_customer_fullname", email: "mtn_ci_email", phone: "mtn_ci_phone_number", token: "payment_token" },
    extra: { mtn_ci_wallet_provider: "MTNCI" },
  },
  "moov-ci": {
    slug: "moov-ci",
    flow: "push",
    fields: { name: "moov_ci_customer_fullname", email: "moov_ci_email", phone: "moov_ci_phone_number", token: "payment_token" },
  },
  "wave-ci": {
    slug: "wave-ci",
    flow: "redirect",
    fields: { name: "wave_ci_fullName", email: "wave_ci_email", phone: "wave_ci_phone", token: "wave_ci_payment_token" },
  },
  "djamo-ci": {
    slug: "djamo",
    flow: "redirect",
    fields: { name: "djamo_fullName", email: "djamo_email", phone: "djamo_phone", token: "djamo_payment_token" },
    extra: { code_country: "ci" },
  },
  "orange-money-bf": {
    slug: "orange-money-burkina",
    flow: "otp-upfront",
    fields: { name: "name_bf", email: "email_bf", phone: "phone_bf", token: "payment_token", otp: "otp_code" },
  },
  "moov-bf": {
    slug: "moov-burkina",
    flow: "push",
    fields: {
      name: "moov_burkina_faso_fullName",
      email: "moov_burkina_faso_email",
      phone: "moov_burkina_faso_phone_number",
      token: "moov_burkina_faso_payment_token",
    },
  },
  "moov-benin": {
    slug: "moov-benin",
    flow: "push",
    fields: {
      name: "moov_benin_customer_fullname",
      email: "moov_benin_email",
      phone: "moov_benin_phone_number",
      token: "payment_token",
    },
  },
  "mtn-benin": {
    slug: "mtn-benin",
    flow: "push",
    fields: {
      name: "mtn_benin_customer_fullname",
      email: "mtn_benin_email",
      phone: "mtn_benin_phone_number",
      token: "payment_token",
    },
    extra: { mtn_benin_wallet_provider: "MTNBENIN" },
  },
  "orange-money-ml": {
    slug: "orange-money-mali",
    flow: "push",
    fields: {
      name: "orange_money_mali_customer_fullname",
      email: "orange_money_mali_email",
      phone: "orange_money_mali_phone_number",
      token: "payment_token",
      address: "orange_money_mali_customer_address",
    },
  },
  "moov-ml": {
    slug: "moov-mali",
    flow: "push",
    fields: {
      name: "moov_ml_customer_fullname",
      email: "moov_ml_email",
      phone: "moov_ml_phone_number",
      token: "payment_token",
      address: "moov_ml_customer_address",
    },
  },
  "mtn-cameroun": {
    slug: "mtn-cameroun",
    flow: "push",
    fields: {
      name: "mtn_cameroun_customer_fullname",
      email: "mtn_cameroun_email",
      phone: "mtn_cameroun_phone_number",
      token: "payment_token",
    },
    extra: { mtn_cameroun_wallet_provider: "MTNCAMEROUN" },
  },
  "celtiis-cash": {
    slug: "celtiis-cash",
    flow: "push",
    fields: {
      name: "celtiis_cash_customer_fullname",
      email: "celtiis_cash_customer_email",
      phone: "celtiis_cash_phone_number",
      token: "payment_token",
    },
  },
};

const DEFAULT_ADDRESS = "Togo";

/** Identifiant frontend pour Wizall (Sénégal) — absent de `SOFTPAY_OPERATORS`, traité à part (deux appels). */
export const WIZALL_OPERATOR_ID = "wizall-sn" as const;

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
 * Ne gère pas Wizall (deux appels, voir `wizallInitiate`/`wizallConfirm`).
 */
export async function softpayCharge(input: SoftpayChargeInput): Promise<SoftpayChargeResult> {
  const operator = SOFTPAY_OPERATORS[input.operator];
  const { fields } = operator;

  const payload: Record<string, string> = {
    [fields.name]: input.fullName,
    [fields.email]: input.email,
    [fields.phone]: input.phone,
    [fields.token]: input.invoiceToken,
    ...operator.extra,
  };
  if (fields.address) payload[fields.address] = DEFAULT_ADDRESS;
  if (fields.otp && input.otp) payload[fields.otp] = input.otp;

  return postSoftpay(operator.slug, payload);
}

async function postSoftpay(slug: string, payload: Record<string, string>): Promise<SoftpayChargeResult> {
  let response: Response;
  try {
    response = await fetch(`${PAYDUNYA_API_V1}/softpay/${slug}`, {
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

export interface WizallInitiateResult {
  status: "success" | "error";
  message: string;
  transactionId?: string;
}

/** Premier appel Wizall (Sénégal) — renvoie un `transactionId` à ressaisir avec le code reçu par SMS. */
export async function wizallInitiate(input: {
  invoiceToken: string;
  fullName: string;
  email: string;
  phone: string;
}): Promise<WizallInitiateResult> {
  let response: Response;
  try {
    response = await fetch(`${PAYDUNYA_API_V1}/softpay/wizall-money-senegal`, {
      method: "POST",
      headers: paydunyaAuthHeaders(),
      body: JSON.stringify({
        customer_name: input.fullName,
        customer_email: input.email,
        phone_number: input.phone,
        invoice_token: input.invoiceToken,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Erreur réseau vers PayDunya." };
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    return { status: "error", message: body?.message ?? "Paiement refusé." };
  }

  const transactionId = body?.data?.TransactionID;
  if (typeof transactionId !== "string") {
    return { status: "error", message: "Réponse Wizall inattendue (identifiant de transaction manquant)." };
  }
  return { status: "success", message: body?.message ?? "Code envoyé par SMS.", transactionId };
}

/** Second appel Wizall — le token renvoyé ici (pas celui de la facture) devient `payment_reference` pour le webhook. */
export async function wizallConfirm(input: {
  transactionId: string;
  phone: string;
  authorizationCode: string;
}): Promise<{ status: "success" | "error"; message: string; token?: string }> {
  let response: Response;
  try {
    response = await fetch(`${PAYDUNYA_API_V1}/softpay/wizall-money-senegal/confirm`, {
      method: "POST",
      headers: paydunyaAuthHeaders(),
      body: JSON.stringify({
        authorization_code: input.authorizationCode,
        phone_number: input.phone,
        transaction_id: input.transactionId,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Erreur réseau vers PayDunya." };
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    return { status: "error", message: body?.message ?? "Code invalide ou expiré." };
  }
  return { status: "success", message: body?.message ?? "Paiement confirmé.", token: body?.token };
}
