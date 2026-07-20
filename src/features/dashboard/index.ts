/**
 * API publique de la feature dashboard (vue d'ensemble admin). Toute la
 * feature est server-only : consommée uniquement par `(app)/admin/page.tsx`
 * (Server Component), jamais par un composant client.
 */
export { getTotalUsers, getUserGrowth, getRecentSignups } from "./lib/user-metrics";
export type { UserGrowthPoint, RecentSignup } from "./lib/user-metrics";

export { getPlanDistribution } from "./lib/subscription-metrics";
export type { PlanDistributionRow } from "./lib/subscription-metrics";

export { getRevenueSummary } from "./lib/revenue-metrics";
export type { RevenueSummary } from "./lib/revenue-metrics";

export { KpiCard } from "./components/kpi-card";
export { UserGrowthChart } from "./components/user-growth-chart";
export { PlanDistributionChart } from "./components/plan-distribution-chart";
export { RecentSignupsTable } from "./components/recent-signups-table";
export { RoadmapPanel } from "./components/roadmap-panel";
export { PeriodSelector } from "./components/period-selector";
