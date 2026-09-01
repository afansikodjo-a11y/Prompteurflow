/**
 * API publique de la feature « admin » (édition des plans tarifaires,
 * programme d'affiliation, gestion des clients).
 */
export { PlanEditorForm } from "./components/plan-editor-form";
export { useAdminPlans, type UseAdminPlansResult } from "./hooks/use-admin-plans";
export { AffiliateRateForm } from "./components/affiliate-rate-form";
export { AffiliateAdminPanel } from "./components/affiliate-admin-panel";
export { CustomersTable } from "./components/customers-table";
export type { AdminAffiliateRow, AdminCustomerRow } from "./types";
