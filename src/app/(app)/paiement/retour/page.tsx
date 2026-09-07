"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, MessageCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { usePollSubscriptionStatus } from "@/features/subscription";

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
 * Retour du fournisseur de paiement (PayDunya ou Moneroo, voir
 * `checkout/lib/providers.ts`) après paiement — jamais la source de vérité
 * (le webhook l'est), juste un retour rassurant pendant que le webhook
 * arrive. `usePollSubscriptionStatus` (partagé avec le dialogue SoftPay)
 * fait l'interrogation elle-même.
 */
export default function PaiementRetourPage() {
  const status = usePollSubscriptionStatus(true);

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
            Nous confirmons votre paiement — ça ne prend généralement que quelques instants.
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
