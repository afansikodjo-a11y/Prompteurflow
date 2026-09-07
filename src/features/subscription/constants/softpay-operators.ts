/**
 * Métadonnées d'affichage des opérateurs SoftPay — id/label/indicatif
 * uniquement, jamais les noms de champs PayDunya (ceux-là restent
 * server-only, voir `api/checkout/lib/paydunya-softpay.ts`). Les deux
 * listes doivent rester synchronisées manuellement (mêmes id).
 */
export const SOFTPAY_OPERATOR_OPTIONS = [
  { id: "t-money-togo", label: "T-Money", dialCode: "228" },
  { id: "moov-togo", label: "Moov Money / Mixx", dialCode: "228" },
] as const;

export type SoftpayOperatorOptionId = (typeof SOFTPAY_OPERATOR_OPTIONS)[number]["id"];
