/**
 * Contrat commun à tous les fournisseurs de paiement (Moneroo, PayDunya) —
 * `checkout/route.ts` traite chaque fournisseur de façon identique une fois
 * ce contrat respecté, jamais de branche spécifique à un fournisseur donné
 * en dehors de son propre fichier `lib/<fournisseur>.ts`.
 */
export type PaymentProviderId = "moneroo" | "paydunya";

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

export class PaymentUpstreamError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PaymentUpstreamError";
    this.status = status;
  }
}
