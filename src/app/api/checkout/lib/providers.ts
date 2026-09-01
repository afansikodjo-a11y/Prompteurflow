import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import * as moneroo from "./moneroo";
import type { InitializePaymentInput, InitializePaymentResult, PaymentProviderId } from "./payment-provider";
import * as saspay from "./saspay";

/**
 * Ordre d'essai des fournisseurs — constante de code, pas une donnée admin
 * (seule l'activation/désactivation l'est, voir `payment_providers`/
 * `resolveActiveProvider`). Un seul fournisseur est tenté par paiement : le
 * premier de cette liste marqué actif en base. Pas de bascule automatique
 * vers le suivant si l'appel API échoue en cours de requête — seulement si
 * un fournisseur est explicitement désactivé.
 */
export const PROVIDER_ORDER: PaymentProviderId[] = ["saspay", "moneroo"];

const PROVIDERS: Record<PaymentProviderId, { initializePayment: (input: InitializePaymentInput) => Promise<InitializePaymentResult> }> = {
  saspay,
  moneroo,
};

export function getProvider(id: PaymentProviderId) {
  return PROVIDERS[id];
}

interface PaymentProviderRow {
  id: PaymentProviderId;
  enabled: boolean;
}

/** Premier fournisseur de `PROVIDER_ORDER` marqué actif en base, ou `null` si aucun. */
export async function resolveActiveProvider(supabase: SupabaseClient): Promise<PaymentProviderId | null> {
  const { data } = await supabase.from("payment_providers").select("id, enabled");
  const enabledIds = new Set((data as PaymentProviderRow[] | null ?? []).filter((row) => row.enabled).map((row) => row.id));
  return PROVIDER_ORDER.find((id) => enabledIds.has(id)) ?? null;
}
