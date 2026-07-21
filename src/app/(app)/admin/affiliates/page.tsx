import { AffiliateLedgerTable, AffiliateRateForm } from "@/features/admin";

/**
 * Panneau admin — programme d'affiliation : taux global + suivi des
 * versements. Accès protégé par `layout.tsx` (garde serveur + RLS).
 */
export default function AdminAffiliatesPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Affiliation</h1>
      <p className="text-muted-foreground mt-2">Taux de commission et suivi des versements.</p>
      <div className="mt-8 flex flex-col gap-6">
        <AffiliateRateForm />
        <div>
          <h2 className="font-semibold">Affiliés</h2>
          <div className="mt-3">
            <AffiliateLedgerTable />
          </div>
        </div>
      </div>
    </section>
  );
}
