"use client";

import Link from "next/link";

import { FEATURE_FLAGS } from "@/config/flags";
import { BASIC_PLAN_ID } from "../constants";
import { useMySubscriptionDetails, type MySubscriptionStatus } from "../hooks/use-my-subscription-details";
import { planFeatureLines } from "../lib/plan-feature-lines";

const XOF_FORMATTER = new Intl.NumberFormat("fr-FR");
const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

const STATUS_INFO: Record<MySubscriptionStatus, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-brand/15 text-brand-bright" },
  pending: { label: "Paiement en attente", className: "bg-amber-500/15 text-amber-400" },
  canceled: { label: "Annulé", className: "bg-white/5 text-muted-foreground" },
  past_due: { label: "Paiement en retard", className: "bg-destructive/15 text-destructive" },
  none: { label: "Aucun abonnement payant", className: "bg-white/5 text-muted-foreground" },
};

/**
 * Statut réel de l'abonnement de l'utilisateur connecté — plan, prix, date
 * de renouvellement. Affiche un rappel explicite si `openAccess` est actif
 * : ce statut reste honnête même quand tout est débloqué gratuitement en
 * phase de test.
 */
export function MySubscriptionCard() {
  const { loading, plan, status, billingPeriod, currentPeriodEnd } = useMySubscriptionDetails();

  if (loading || !plan) {
    return <p className="text-muted-foreground text-sm">Chargement…</p>;
  }

  const statusInfo = STATUS_INFO[status];
  const periodLabel = billingPeriod === "annual" ? "an" : "mois";
  const priceForPeriod = billingPeriod === "annual" ? (plan.annualPriceXof ?? plan.priceXof) : plan.priceXof;

  return (
    <div className="bg-card flex flex-col gap-6 rounded-lg border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">Formule actuelle</p>
          <p className="text-2xl font-bold tracking-tight">{plan.name}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      {plan.id !== BASIC_PLAN_ID && status === "active" && (
        <p className="text-muted-foreground text-sm">
          {XOF_FORMATTER.format(priceForPeriod)} FCFA / {periodLabel}
          {currentPeriodEnd && <> — renouvellement le {DATE_FORMATTER.format(new Date(currentPeriodEnd))}</>}
        </p>
      )}

      {FEATURE_FLAGS.openAccess && (
        <p className="text-muted-foreground rounded-md bg-white/5 p-3 text-xs">
          Phase de test : toutes les fonctionnalités Pro sont débloquées gratuitement pour l&apos;instant, quel que
          soit votre abonnement réel ci-dessus.
        </p>
      )}

      <ul className="flex flex-col gap-2 text-sm">
        {planFeatureLines(plan).map((line) => (
          <li key={line} className="text-muted-foreground">
            • {line}
          </li>
        ))}
      </ul>

      <Link href="/#pricing" className="text-brand-bright text-sm underline">
        Changer de formule
      </Link>
    </div>
  );
}
