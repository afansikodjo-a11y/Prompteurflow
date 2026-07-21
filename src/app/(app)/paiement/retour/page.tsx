"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10; // ~30s

type Status = "checking" | "active" | "timeout";

/**
 * Retour Moneroo après paiement — jamais la source de vérité (le webhook
 * l'est), juste un retour rassurant pendant que le webhook arrive. Vérifie
 * simplement si l'abonnement le plus récent de l'utilisateur est déjà actif.
 */
export default function PaiementRetourPage() {
  const [status, setStatus] = React.useState<Status>("checking");

  React.useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        if (!cancelled) setStatus("timeout");
        return;
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (data?.status === "active") {
        setStatus("active");
        return;
      }

      attempts += 1;
      if (attempts >= MAX_POLLS) {
        setStatus("timeout");
        return;
      }
      setTimeout(() => void poll(), POLL_INTERVAL_MS);
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      {status === "active" ? (
        <>
          <CheckCircle2 className="text-brand-bright size-12" />
          <h1 className="text-2xl font-bold tracking-tight">Paiement confirmé</h1>
          <p className="text-muted-foreground text-sm">Votre abonnement est actif.</p>
          <Button asChild>
            <Link href="/studio">Aller au Studio</Link>
          </Button>
        </>
      ) : status === "checking" ? (
        <>
          <Loader2 className="text-muted-foreground size-12 animate-spin" />
          <h1 className="text-2xl font-bold tracking-tight">Confirmation en cours</h1>
          <p className="text-muted-foreground text-sm">
            Nous confirmons votre paiement avec Moneroo — ça ne prend généralement que quelques instants.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold tracking-tight">Ça prend plus de temps que prévu</h1>
          <p className="text-muted-foreground text-sm">
            Votre paiement est en cours de traitement. Si votre abonnement n&apos;est pas actif d&apos;ici quelques
            minutes, contactez-nous.
          </p>
          <Button asChild variant="outline">
            <Link href="/studio">Aller au Studio</Link>
          </Button>
        </>
      )}
    </section>
  );
}
