"use client";

import * as React from "react";
import Link from "next/link";
import { Check, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { useAuth } from "@/features/auth";
import { PRO_PLAN_ID } from "../constants";
import { usePaymentProvidersAvailability } from "../hooks/use-payment-providers-availability";
import { annualSavingsPercent } from "../lib/annual-savings";
import { startCheckout } from "../lib/checkout-client";
import { formatXof } from "../lib/format-price";
import { planFeatureLines } from "../lib/plan-feature-lines";
import type { BillingPeriod, Plan, PlanId } from "../types";
import { AnnualSavingsChoice } from "./annual-savings-choice";
import { SoftpayDialog } from "./softpay-dialog";

const SUPPORT_MESSAGE = "Bonjour, je n'arrive pas à m'abonner sur PrompteurFlow, pouvez-vous m'aider ?";

/**
 * Prix à afficher pour un plan selon la période choisie. Replie sur le
 * mensuel si le plan n'a pas de palier annuel (ex. Découverte) — le bouton
 * mensuel/annuel n'a alors aucun effet visuel sur cette carte.
 */
function resolvePrice(plan: Plan, period: BillingPeriod) {
  const useAnnual = period === "annual" && plan.annualPriceXof !== null;
  return {
    amount: useAnnual ? plan.annualPriceXof! : plan.priceXof,
    barred: useAnnual ? plan.annualPriceBarredXof : plan.priceBarredXof,
    suffix: useAnnual ? " / an" : " / mois",
    /** Économie vs mensuel × 12 — affichée seulement sur la vue annuelle. */
    savingsPercent: useAnnual ? annualSavingsPercent(plan) : null,
  };
}

interface PricingCardsProps {
  plans: Plan[];
}

/**
 * Grille de cartes tarifs (toggle mensuel/annuel, checkout) — partagée entre
 * la section tarifs de la landing (`PricingSection`) et l'écran de blocage
 * du studio (`StudioPaywall`, choix de formule sans quitter l'app). Une
 * seule source pour ne jamais laisser les deux affichages diverger.
 */
export function PricingCards({ plans }: PricingCardsProps) {
  const { user } = useAuth();
  const { paydunyaEnabled } = usePaymentProvidersAvailability();
  const [period, setPeriod] = React.useState<BillingPeriod>("monthly");
  const [loadingPlanId, setLoadingPlanId] = React.useState<PlanId | null>(null);
  const [pendingPeriod, setPendingPeriod] = React.useState<BillingPeriod | null>(null);
  const [checkoutError, setCheckoutError] = React.useState<{ planId: PlanId; message: string } | null>(null);
  // Popup d'économie annuelle en cours (plan concerné, ou `null`) — distinct
  // de `period` (le mensuel/annuel affiché sur les cartes) : ce popup ne
  // s'ouvre que si on payait au mois par défaut, jamais si l'annuel a déjà
  // été choisi explicitement via le bouton en haut.
  const [upsellPlan, setUpsellPlan] = React.useState<Plan | null>(null);
  // Dialogue SoftPay (paiement Mobile Money sur place) en cours, ou `null` —
  // proposé en priorité si PayDunya est actif, avec un repli explicite vers
  // `runCheckout` (redirection classique) pour qui préfère payer autrement.
  const [softpayPlan, setSoftpayPlan] = React.useState<Plan | null>(null);
  const [softpayPeriod, setSoftpayPeriod] = React.useState<BillingPeriod>("monthly");
  const hasAnnualOption = plans.some((plan) => plan.annualPriceXof !== null);
  // Meilleure économie annuelle tous plans confondus, pour le rappel sous le
  // toggle Mensuel/Annuel — jamais un pourcentage en dur, toujours dérivé des
  // vrais prix (même logique que `planFeatureLines`).
  const maxSavingsPercent = plans.reduce<number | null>((max, plan) => {
    const savings = annualSavingsPercent(plan);
    if (savings === null) return max;
    return max === null ? savings : Math.max(max, savings);
  }, null);

  const runCheckout = async (planId: Exclude<PlanId, "standard">, billingPeriod: BillingPeriod) => {
    setCheckoutError(null);
    setLoadingPlanId(planId);
    setPendingPeriod(billingPeriod);
    const result = await startCheckout(planId, billingPeriod);
    if (!result.ok) {
      setUpsellPlan(null);
      setCheckoutError({ planId, message: result.error });
      setLoadingPlanId(null);
      setPendingPeriod(null);
      return;
    }
    window.location.href = result.checkoutUrl;
  };

  // Point d'entrée commun une fois la période tranchée (choisie directement,
  // ou via le popup d'économie annuelle) : SoftPay (paiement sur place) si
  // PayDunya est actif, sinon la redirection classique inchangée.
  const initiatePayment = (plan: Plan, billingPeriod: BillingPeriod) => {
    if (paydunyaEnabled) {
      setUpsellPlan(null);
      setSoftpayPlan(plan);
      setSoftpayPeriod(billingPeriod);
      return;
    }
    void runCheckout(plan.id as Exclude<PlanId, "standard">, billingPeriod);
  };

  const handleSubscribe = (plan: Plan) => {
    if (period === "monthly" && plan.annualPriceXof !== null) {
      setUpsellPlan(plan);
      return;
    }
    initiatePayment(plan, period);
  };

  return (
    <>
      {hasAnnualOption && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setPeriod("monthly")}
              aria-pressed={period === "monthly"}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                period === "monthly" ? "bg-brand text-black" : "text-neutral-400 hover:text-white",
              )}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setPeriod("annual")}
              aria-pressed={period === "annual"}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                period === "annual" ? "bg-brand text-black" : "text-neutral-400 hover:text-white",
              )}
            >
              Annuel
            </button>
          </div>
          {period === "monthly" && maxSavingsPercent !== null && maxSavingsPercent > 0 && (
            <p className="text-brand text-center text-sm font-medium">
              Économisez jusqu&apos;à {maxSavingsPercent}&nbsp;% avec le plan annuel 💰
            </p>
          )}
        </div>
      )}

      {plans.length === 0 ? (
        <p className="mt-12 text-center text-sm text-neutral-500">
          Les tarifs sont momentanément indisponibles — réessayez dans un instant.
        </p>
      ) : (
        <div className="mx-auto mt-12 grid max-w-2xl gap-6 sm:grid-cols-2">
          {plans.map((plan) => {
            const highlighted = plan.id === PRO_PLAN_ID;
            const price = resolvePrice(plan, period);
            const showBarred = price.barred !== null && price.barred > price.amount;
            const isLoading = loadingPlanId === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex h-full flex-col gap-6 rounded-2xl border p-6",
                  highlighted
                    ? "border-brand/30 bg-brand/[0.06] shadow-2xl shadow-black/50"
                    : "border-white/10 bg-white/[0.03]",
                )}
              >
                {highlighted && (
                  <span className="bg-brand shadow-brand/30 absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium text-black shadow-lg">
                    Le plus populaire
                  </span>
                )}
                <div>
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                  <p className="mt-2 flex flex-wrap items-baseline gap-2">
                    {showBarred && (
                      <span className="text-lg text-neutral-500 line-through">{formatXof(price.barred!)}</span>
                    )}
                    <span className="text-3xl font-bold tracking-tight text-white">{formatXof(price.amount)}</span>
                    {price.amount > 0 && <span className="text-sm text-neutral-500">{price.suffix}</span>}
                    {price.savingsPercent !== null && price.savingsPercent > 0 && (
                      <span className="bg-brand/15 text-brand-bright rounded-full px-2 py-0.5 text-xs font-medium">
                        -{price.savingsPercent}&nbsp;%
                      </span>
                    )}
                  </p>
                  {price.savingsPercent !== null && price.savingsPercent > 0 && (
                    <p className="mt-1 text-xs text-neutral-500">
                      Soit {formatXof(plan.priceXof * 12 - plan.annualPriceXof!)} d&apos;économie vs mensuel
                    </p>
                  )}
                </div>

                <ul className="flex flex-1 flex-col gap-2.5 text-sm text-neutral-300">
                  {planFeatureLines(plan).map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <Check className="text-brand-bright mt-0.5 size-4 shrink-0" />
                      {line}
                    </li>
                  ))}
                </ul>

                {!user ? (
                  <Button
                    asChild
                    className={cn(
                      highlighted
                        ? "bg-brand shadow-brand/30 hover:bg-brand-bright text-black shadow-lg"
                        : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
                    )}
                  >
                    <Link href="/signup">Créer un compte</Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleSubscribe(plan)}
                    disabled={loadingPlanId !== null}
                    className={cn(
                      highlighted
                        ? "bg-brand shadow-brand/30 hover:bg-brand-bright text-black shadow-lg"
                        : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
                    )}
                  >
                    {isLoading ? "Redirection…" : "S'abonner"}
                  </Button>
                )}
                {checkoutError?.planId === plan.id && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-destructive text-sm">{checkoutError.message}</p>
                    <a
                      href={buildWhatsAppLink(siteConfig.supportWhatsAppPhone, SUPPORT_MESSAGE)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-bright inline-flex items-center gap-1.5 text-xs underline"
                    >
                      <MessageCircle className="size-3.5" />
                      Contacter le support via WhatsApp
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={upsellPlan !== null} onOpenChange={(open) => !open && setUpsellPlan(null)}>
        <DialogContent>
          {upsellPlan && (
            <>
              <DialogHeader>
                <DialogTitle>Avant de continuer</DialogTitle>
                <DialogDescription>Vous êtes sur le point de payer {upsellPlan.name} au mois.</DialogDescription>
              </DialogHeader>
              <AnnualSavingsChoice
                plan={upsellPlan}
                pendingPeriod={pendingPeriod}
                onChoose={(chosenPeriod) => initiatePayment(upsellPlan, chosenPeriod)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <SoftpayDialog
        plan={softpayPlan}
        billingPeriod={softpayPeriod}
        onClose={() => setSoftpayPlan(null)}
        onFallbackToHosted={(plan) => {
          setSoftpayPlan(null);
          void runCheckout(plan.id as Exclude<PlanId, "standard">, softpayPeriod);
        }}
      />
    </>
  );
}
