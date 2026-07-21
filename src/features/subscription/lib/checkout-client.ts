import type { PlanId } from "../types";

export type StartCheckoutResult = { ok: true; checkoutUrl: string } | { ok: false; error: string };

/** Démarre un checkout Moneroo pour un plan payant — le résultat contient l'URL vers laquelle rediriger. */
export async function startCheckout(
  planId: Exclude<PlanId, "basic">,
  billingPeriod: "monthly" | "annual",
): Promise<StartCheckoutResult> {
  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, billingPeriod }),
    });
    const body = await response.json();
    if (!response.ok) {
      return { ok: false, error: body.error ?? "Impossible de démarrer le paiement." };
    }
    return { ok: true, checkoutUrl: body.checkoutUrl };
  } catch {
    return { ok: false, error: "Impossible de contacter le serveur. Vérifiez votre connexion." };
  }
}
