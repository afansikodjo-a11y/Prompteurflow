import { AffiliateAdminPanel, AffiliateRateForm } from "@/features/admin";

/**
 * Panneau admin — programme d'affiliation sur demande : taux global,
 * activation par email, suivi des versements. Accès protégé par
 * `layout.tsx` (garde serveur + RLS).
 */
export default function AdminAffiliatesPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Affiliation</h1>
      <p className="text-muted-foreground mt-2">Programme sur demande — taux de commission et comptes activés.</p>
      <div className="mt-8 flex flex-col gap-6">
        <AffiliateRateForm />
        <AffiliateAdminPanel />
      </div>
    </section>
  );
}
