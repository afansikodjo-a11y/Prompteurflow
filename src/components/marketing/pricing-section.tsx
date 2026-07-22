"use client";

import * as React from "react";
import Link from "next/link";
import { Check, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { useAuth } from "@/features/auth";
import {
  BASIC_PLAN_ID,
  planFeatureLines,
  startCheckout,
  STANDARD_PLAN_ID,
  type Plan,
  type PlanId,
} from "@/features/subscription";
import { Reveal } from "./reveal";

const XOF_FORMATTER = new Intl.NumberFormat("fr-FR");
const SUPPORT_MESSAGE = "Bonjour, je n'arrive pas à m'abonner sur PrompteurFlow, pouvez-vous m'aider ?";

type BillingPeriod = "monthly" | "annual";

function formatPrice(priceXof: number): string {
  return priceXof === 0 ? "Gratuit" : `${XOF_FORMATTER.format(priceXof)} FCFA`;
}


/**
 * Prix à afficher pour un plan selon la période choisie. Replie sur le
 * mensuel si le plan n'a pas de palier annuel (ex. Basique, gratuit) — le
 * bouton mensuel/annuel n'a alors aucun effet visuel sur cette carte.
 */
function resolvePrice(plan: Plan, period: BillingPeriod) {
  const useAnnual = period === "annual" && plan.annualPriceXof !== null;
  return {
    amount: useAnnual ? plan.annualPriceXof! : plan.priceXof,
    barred: useAnnual ? plan.annualPriceBarredXof : plan.priceBarredXof,
    suffix: useAnnual ? " / an" : " / mois",
  };
}

interface PricingSectionProps {
  plans: Plan[];
}

export function PricingSection({ plans }: PricingSectionProps) {
  const { user } = useAuth();
  const [period, setPeriod] = React.useState<BillingPeriod>("monthly");
  const [loadingPlanId, setLoadingPlanId] = React.useState<PlanId | null>(null);
  const [checkoutError, setCheckoutError] = React.useState<{ planId: PlanId; message: string } | null>(null);
  const hasAnnualOption = plans.some((plan) => plan.annualPriceXof !== null);

  const handleSubscribe = async (planId: Exclude<PlanId, "basic">) => {
    setCheckoutError(null);
    setLoadingPlanId(planId);
    const result = await startCheckout(planId, period);
    if (!result.ok) {
      setCheckoutError({ planId, message: result.error });
      setLoadingPlanId(null);
      return;
    }
    window.location.href = result.checkoutUrl;
  };

  return (
    <section id="pricing" className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Choisissez votre formule
          </h2>
          <p className="mt-4 text-lg text-pretty text-neutral-400">
            Commencez gratuitement, passez à la vitesse supérieure quand vous en avez besoin.
          </p>
        </Reveal>

        {hasAnnualOption && (
          <Reveal delay={0.05} className="mt-8 flex justify-center">
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
          </Reveal>
        )}

        {plans.length === 0 ? (
          <p className="mt-12 text-center text-sm text-neutral-500">
            Les tarifs sont momentanément indisponibles — réessayez dans un instant.
          </p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {plans.map((plan, index) => {
              const highlighted = plan.id === STANDARD_PLAN_ID;
              const price = resolvePrice(plan, period);
              const showBarred = price.barred !== null && price.barred > price.amount;
              const isBasic = plan.id === BASIC_PLAN_ID;
              const isLoading = loadingPlanId === plan.id;
              return (
                <Reveal key={plan.id} delay={index * 0.08}>
                  <div
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
                          <span className="text-lg text-neutral-500 line-through">{formatPrice(price.barred!)}</span>
                        )}
                        <span className="text-3xl font-bold tracking-tight text-white">
                          {formatPrice(price.amount)}
                        </span>
                        {price.amount > 0 && <span className="text-sm text-neutral-500">{price.suffix}</span>}
                      </p>
                    </div>

                    <ul className="flex flex-1 flex-col gap-2.5 text-sm text-neutral-300">
                      {planFeatureLines(plan).map((line) => (
                        <li key={line} className="flex items-start gap-2">
                          <Check className="text-brand-bright mt-0.5 size-4 shrink-0" />
                          {line}
                        </li>
                      ))}
                    </ul>

                    {isBasic ? (
                      <Button
                        asChild
                        className={cn(
                          highlighted
                            ? "bg-brand shadow-brand/30 hover:bg-brand-bright text-black shadow-lg"
                            : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
                        )}
                      >
                        <Link href="/studio">Commencer gratuitement</Link>
                      </Button>
                    ) : !user ? (
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
                        onClick={() => void handleSubscribe(plan.id as Exclude<PlanId, "basic">)}
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
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
