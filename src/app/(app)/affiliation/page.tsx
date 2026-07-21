import { redirect } from "next/navigation";

import { AffiliateDashboard } from "@/features/affiliate";
import { createClient } from "@/lib/supabase/server";

/**
 * Programme d'affiliation — sur demande : accessible uniquement aux comptes
 * activés par un admin (`profiles.is_affiliate`), pas à tout utilisateur
 * connecté.
 */
export default async function AffiliationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_affiliate").eq("id", user.id).single();

  if (!profile?.is_affiliate) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Programme d&apos;affiliation</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Ce programme est disponible sur demande. Contactez-nous pour l&apos;activer sur votre compte.
        </p>
      </section>
    );
  }

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
