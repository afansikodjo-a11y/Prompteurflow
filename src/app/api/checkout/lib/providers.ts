import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import * as moneroo from "./moneroo";
import * as paydunya from "./paydunya";
import type { InitializePaymentInput, InitializePaymentResult, PaymentProviderId } from "./payment-provider";

/**
 * Ordre d'essai des fournisseurs — constante de code, pas une donnée admin
 * (seule l'activation/désactivation l'est, voir `payment_providers`/
 * `resolveEnabledProviders`). `checkout/route.ts` parcourt cette liste dans
 * l'ordre et retombe sur le suivant actif si l'appel API du précédent
 * échoue (clé manquante, erreur réseau, panne amont...) — jamais d'erreur
 * affichée au client tant qu'il reste un fournisseur actif à essayer.
 */
export const PROVIDER_ORDER: PaymentProviderId[] = ["paydunya", "moneroo"];

const PROVIDERS: Record<PaymentProviderId, { initializePayment: (input: InitializePaymentInput) => Promise<InitializePaymentResult> }> = {
  paydunya,
  moneroo,
};

export function getProvider(id: PaymentProviderId) {
  return PROVIDERS[id];
}

interface PaymentProviderRow {
  id: PaymentProviderId;
  enabled: boolean;
}

/** Fournisseurs actifs en base, dans l'ordre de `PROVIDER_ORDER` (liste vide si aucun). */
export async function resolveEnabledProviders(supabase: SupabaseClient): Promise<PaymentProviderId[]> {
  const { data } = await supabase.from("payment_providers").select("id, enabled");
  const enabledIds = new Set((data as PaymentProviderRow[] | null ?? []).filter((row) => row.enabled).map((row) => row.id));
  return PROVIDER_ORDER.filter((id) => enabledIds.has(id));
}
