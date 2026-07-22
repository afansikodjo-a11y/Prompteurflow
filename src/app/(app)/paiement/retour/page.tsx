"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MessageCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/client";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10; // ~30s

type Status = "checking" | "active" | "failed" | "timeout";

const SUPPORT_MESSAGE = "Bonjour, mon paiement PrompteurFlow n'a pas abouti, pouvez-vous m'aider ?";

function SupportWhatsAppLink() {
  return (
    <a
      href={buildWhatsAppLink(siteConfig.supportWhatsAppPhone, SUPPORT_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-bright inline-flex items-center gap-1.5 text-sm underline"
    >
      <MessageCircle className="size-4" />
      Contacter le support via WhatsApp
    </a>
  );
}

/**
 * Retour Moneroo après paiement — jamais la source de vérité (le webhook
 * l'est), juste un retour rassurant pendant que le webhook arrive. Vérifie
 * simplement si l'abonnement le plus récent de l'utilisateur est déjà actif,
 * explicitement annulé (paiement échoué/annulé côté Moneroo), ou toujours en
 * attente après le délai d'observation.
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
      if (data?.status === "canceled") {
        setStatus("failed");
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
      ) : status === "failed" ? (
        <>
          <XCircle className="text-destructive size-12" />
          <h1 className="text-2xl font-bold tracking-tight">Le paiement n&apos;a pas abouti</h1>
          <p className="text-muted-foreground text-sm">
            Votre paiement a échoué ou a été annulé — aucun montant ne devrait avoir été débité. Vous pouvez
            réessayer, ou nous contacter si le problème persiste.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/#pricing">Réessayer</Link>
            </Button>
            <SupportWhatsAppLink />
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold tracking-tight">Ça prend plus de temps que prévu</h1>
          <p className="text-muted-foreground text-sm">
            Votre paiement est en cours de traitement. Si votre abonnement n&apos;est pas actif d&apos;ici quelques
            minutes, contactez-nous.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/studio">Aller au Studio</Link>
            </Button>
            <SupportWhatsAppLink />
          </div>
        </>
      )}
    </section>
  );
}
