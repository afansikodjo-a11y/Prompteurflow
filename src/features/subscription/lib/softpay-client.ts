import type { BillingPeriod, PlanId } from "../types";

export type StartSoftpayResult =
  | { ok: true; status: "pending" | "success"; message: string }
  | { ok: true; status: "redirect"; url: string }
  | { ok: true; status: "wizall_pending"; transactionId: string; message: string }
  | { ok: false; error: string };

/** Démarre un paiement SoftPay (mobile money collecté sur place) — PayDunya uniquement. */
export async function startSoftpayCheckout(input: {
  planId: Exclude<PlanId, "standard">;
  billingPeriod: BillingPeriod;
  operator: string;
  fullName: string;
  phone: string;
  otp?: string;
}): Promise<StartSoftpayResult> {
  try {
    const response = await fetch("/api/checkout/softpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = await response.json();
    if (!response.ok || body.status === "error") {
      return { ok: false, error: body.message ?? body.error ?? "Impossible de démarrer le paiement." };
    }
    if (body.status === "redirect") {
      return { ok: true, status: "redirect", url: body.url };
    }
    if (body.status === "wizall_pending") {
      return { ok: true, status: "wizall_pending", transactionId: body.transactionId, message: body.message ?? "" };
    }
    return { ok: true, status: body.status, message: body.message ?? "Validez le paiement sur votre téléphone." };
  } catch {
    return { ok: false, error: "Impossible de contacter le serveur. Vérifiez votre connexion." };
  }
}

export type ConfirmWizallResult = { ok: true; message: string } | { ok: false; error: string };

/** Second appel du flux Wizall (Sénégal) — code reçu par SMS après `startSoftpayCheckout`. */
export async function confirmWizallCheckout(input: {
  transactionId: string;
  phone: string;
  authorizationCode: string;
}): Promise<ConfirmWizallResult> {
  try {
    const response = await fetch("/api/checkout/softpay/wizall-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = await response.json();
    if (!response.ok || body.status === "error") {
      return { ok: false, error: body.message ?? body.error ?? "Code invalide." };
    }
    return { ok: true, message: body.message ?? "Paiement confirmé." };
  } catch {
    return { ok: false, error: "Impossible de contacter le serveur. Vérifiez votre connexion." };
  }
}
