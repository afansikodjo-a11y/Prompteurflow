import type { Plan, PlanId } from "./types";

export const BASIC_PLAN_ID: PlanId = "basic";
export const STANDARD_PLAN_ID: PlanId = "standard";
export const PRO_PLAN_ID: PlanId = "pro";

/**
 * Plan de repli « fail-closed » : utilisé si la lecture Supabase échoue (ou
 * tant que l'utilisateur n'est pas résolu). Toujours les limites Basique —
 * jamais un déblocage silencieux de Standard/Pro.
 */
export const FAIL_CLOSED_PLAN: Plan = {
  id: "basic",
  name: "Basique",
  priceXof: 0,
  maxDurationSec: 120,
  maxScripts: 3,
  watermark: true,
  unlockedFilters: ["none"],
  scriptImport: false,
};
