import { redirect } from "next/navigation";

import { AffiliateDashboard } from "@/features/affiliate";
import { createClient } from "@/lib/supabase/server";

/**
 * Programme d'affiliation — accessible à tout utilisateur connecté (pas de
 * garde de rôle, contrairement à `/admin`).
 */
export default async function AffiliationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Programme d&apos;affiliation</h1>
      <p className="text-muted-foreground mt-2">
        Gagnez une commission sur chaque paiement de vos filleuls, à vie.
      </p>
      <div className="mt-8">
        <AffiliateDashboard />
      </div>
    </section>
  );
}
