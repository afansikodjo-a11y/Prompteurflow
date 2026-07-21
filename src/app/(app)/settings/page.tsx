import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MySubscriptionCard } from "@/features/subscription";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Paramètres",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
      <p className="text-muted-foreground mt-2">Votre abonnement et les détails de votre compte.</p>
      <div className="mt-8">
        <MySubscriptionCard />
      </div>
    </section>
  );
}
