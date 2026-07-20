import { PlanEditorForm } from "@/features/admin";

/**
 * Panneau admin — édition des plans tarifaires.
 * Accès protégé par `layout.tsx` (garde serveur + RLS).
 */
export default function AdminPlansPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Plans</h1>
      <p className="text-muted-foreground mt-2">Prix et limites des plans, éditables sans déploiement.</p>
      <div className="mt-8">
        <PlanEditorForm />
      </div>
    </section>
  );
}
