/**
 * API publique de la feature « subscription » (plans Basique/Standard/Pro).
 */
export { useSubscription, type UseSubscriptionResult } from "./hooks/use-subscription";
export { useMySubscriptionDetails, type MySubscriptionDetails, type MySubscriptionStatus } from "./hooks/use-my-subscription-details";
export { MySubscriptionCard } from "./components/my-subscription-card";
export { AnnualSavingsChoice } from "./components/annual-savings-choice";
export { getAllPlans, getPlan, updatePlan } from "./lib/plans-db";
export { startCheckout, type StartCheckoutResult } from "./lib/checkout-client";
export { planFeatureLines } from "./lib/plan-feature-lines";
export { formatXof } from "./lib/format-price";
export { BASIC_PLAN_ID, STANDARD_PLAN_ID, PRO_PLAN_ID, FAIL_CLOSED_PLAN } from "./constants";
export type { BillingPeriod, Plan, PlanId } from "./types";
