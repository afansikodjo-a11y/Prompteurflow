/**
 * API publique de la feature « subscription » (plans Basique/Standard/Pro).
 */
export { useSubscription, type UseSubscriptionResult } from "./hooks/use-subscription";
export { getAllPlans, updatePlan } from "./lib/plans-db";
export { BASIC_PLAN_ID, STANDARD_PLAN_ID, PRO_PLAN_ID, FAIL_CLOSED_PLAN } from "./constants";
export type { Plan, PlanId } from "./types";
