import {
  getPlanDistribution,
  getRecentSignups,
  getRevenueSummary,
  getTotalUsers,
  getUserGrowth,
  KpiCard,
  PeriodSelector,
  PlanDistributionChart,
  RecentSignupsTable,
  RoadmapPanel,
  UserGrowthChart,
} from "@/features/dashboard";
import { FEATURE_FLAGS } from "@/config/flags";

const VALID_PERIODS = [7, 30, 90];
const DEFAULT_PERIOD_DAYS = 30;

interface AdminOverviewPageProps {
  searchParams: Promise<{ days?: string }>;
}

/**
 * Vue d'ensemble admin — uniquement des métriques adossées à de vraies
 * données (`profiles`, `subscriptions`, `transactions`). Ce qui manque
 * encore (MRR, rétention, funnel, usage produit...) est listé dans
 * `RoadmapPanel`, jamais simulé.
 * Accès protégé par `layout.tsx` (garde serveur + RLS).
 */
export default async function AdminOverviewPage({ searchParams }: AdminOverviewPageProps) {
  const { days: rawDays } = await searchParams;
  const requestedDays = Number(rawDays);
  const days = VALID_PERIODS.includes(requestedDays) ? requestedDays : DEFAULT_PERIOD_DAYS;

  const [totalUsers, growth, recentSignups, planDistribution, revenue] = await Promise.all([
    getTotalUsers(),
    getUserGrowth(days),
    getRecentSignups(5),
    getPlanDistribution(),
    getRevenueSummary(days),
  ]);

  const newUsers = growth.reduce((sum, point) => sum + point.count, 0);
  const activeSubscriptions = planDistribution.reduce((sum, row) => sum + row.activeCount, 0);

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vue d&apos;ensemble</h1>
          <p className="text-muted-foreground mt-2">Ce que PrompteurFlow sait aujourd&apos;hui, rien de plus.</p>
        </div>
        <PeriodSelector activeDays={days} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Utilisateurs au total" value={totalUsers.toLocaleString("fr-FR")} />
        <KpiCard
          label="Nouvelles inscriptions"
          value={newUsers.toLocaleString("fr-FR")}
          hint={`sur ${days} jours`}
        />
        <KpiCard
          label="Abonnements actifs"
          value={activeSubscriptions.toLocaleString("fr-FR")}
          hint={FEATURE_FLAGS.openAccess ? "phase de test — accès Pro ouvert à tous" : undefined}
        />
        <KpiCard
          label="Revenus"
          value={revenue.hasData ? `${revenue.totalXof.toLocaleString("fr-FR")} XOF` : "Pas encore disponible"}
          hint={revenue.hasData ? `sur ${days} jours` : "aucune transaction enregistrée"}
          pending={!revenue.hasData}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 lg:col-span-2">
          <h2 className="font-semibold">Croissance des utilisateurs</h2>
          <div className="mt-4">
            <UserGrowthChart points={growth} />
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Répartition par plan</h2>
          {FEATURE_FLAGS.openAccess && (
            <p className="text-muted-foreground mt-1 text-xs">
              Phase de test : l&apos;accès Pro est ouvert à tous, ces chiffres ne reflètent pas encore de vrais choix
              payants.
            </p>
          )}
          <div className="mt-4">
            <PlanDistributionChart rows={planDistribution} />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 lg:col-span-2">
          <h2 className="font-semibold">Inscriptions récentes</h2>
          <div className="mt-4">
            <RecentSignupsTable signups={recentSignups} />
          </div>
        </div>
        <RoadmapPanel />
      </div>
    </section>
  );
}
