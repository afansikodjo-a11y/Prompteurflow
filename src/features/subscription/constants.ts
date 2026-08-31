import type { Plan, PlanId } from "./types";

export const BASIC_PLAN_ID: PlanId = "basic";
export const STANDARD_PLAN_ID: PlanId = "standard";
export const PRO_PLAN_ID: PlanId = "pro";

/**
 * Coupure du grandfathering : les comptes créés avant cette date gardent
 * l'accès gratuit qu'ils avaient du temps du plan Basique (voir
 * `useSubscription`). Tout compte créé à partir de cette date doit payer
 * Découverte ou Pro pour utiliser le studio.
 */
export const GRANDFATHER_CUTOFF = "2026-08-31T00:00:00Z";

/**
 * Plan de repli « fail-closed » : utilisé si la lecture Supabase échoue (ou
 * tant que l'utilisateur n'est pas résolu). Toujours les limites du plan
 * Découverte (ex-Basique) — jamais un déblocage silencieux de Pro.
 */
export const FAIL_CLOSED_PLAN: Plan = {
  id: "basic",
  name: "Découverte",
  priceXof: 0,
  priceBarredXof: null,
  annualPriceXof: null,
  annualPriceBarredXof: null,
  maxDurationSec: 120,
  maxScripts: 3,
  watermark: true,
  scriptImport: false,
  aiWriter: false,
  isActive: true,
};
