/**
 * API publique de la feature « admin » (édition des plans tarifaires,
 * programme d'affiliation).
 */
export { PlanEditorForm } from "./components/plan-editor-form";
export { useAdminPlans, type UseAdminPlansResult } from "./hooks/use-admin-plans";
export { AffiliateRateForm } from "./components/affiliate-rate-form";
export { AffiliateLedgerTable } from "./components/affiliate-ledger-table";
export { useAdminAffiliateSettings } from "./hooks/use-admin-affiliate-settings";
export { useAdminAffiliateLedger } from "./hooks/use-admin-affiliate-ledger";
export type { AdminAffiliateRow } from "./types";
