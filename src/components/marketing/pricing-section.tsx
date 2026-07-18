import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BASIC_PLAN_ID, STANDARD_PLAN_ID, type Plan } from "@/features/subscription";
import { Reveal } from "./reveal";

const XOF_FORMATTER = new Intl.NumberFormat("fr-FR");

function formatPrice(priceXof: number): string {
  return priceXof === 0 ? "Gratuit" : `${XOF_FORMATTER.format(priceXof)} FCFA`;
}

/** Traduit les limites réelles du plan en lignes lisibles — jamais de texte marketing déconnecté des vraies valeurs. */
function planFeatureLines(plan: Plan): string[] {
  const lines = [
    plan.maxDurationSec === null
      ? "Enregistrement sans limite de durée"
      : `Clips jusqu'à ${plan.maxDurationSec} secondes`,
    plan.maxScripts === null ? "Scripts illimités" : `${plan.maxScripts} scripts sauvegardés`,
    plan.unlockedFilters.length > 1 ? "Tous les filtres vidéo" : "Filtre vidéo de base",
    plan.watermark ? "Filigrane à l'export" : "Aucun filigrane",
  ];
  if (plan.scriptImport) lines.push("Import de script depuis un fichier (.txt)");
  return lines;
}

/** Basique fonctionne sans compte ; les autres paliers passent par l'inscription (le paiement n'est pas encore en ligne). */
function ctaForPlan(plan: Plan): { href: string; label: string } {
  if (plan.id === BASIC_PLAN_ID) return { href: "/studio", label: "Commencer gratuitement" };
  return { href: "/signup", label: "Créer un compte" };
}

interface PricingSectionProps {
  plans: Plan[];
}

export function PricingSection({ plans }: PricingSectionProps) {
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

        {plans.length === 0 ? (
          <p className="mt-12 text-center text-sm text-neutral-500">
            Les tarifs sont momentanément indisponibles — réessayez dans un instant.
          </p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {plans.map((plan, index) => {
              const highlighted = plan.id === STANDARD_PLAN_ID;
              const cta = ctaForPlan(plan);
              return (
                <Reveal key={plan.id} delay={index * 0.08}>
                  <div
                    className={cn(
                      "relative flex h-full flex-col gap-6 rounded-2xl border p-6",
                      highlighted
                        ? "border-violet-400/30 bg-violet-500/[0.06] shadow-2xl shadow-violet-950/50"
                        : "border-white/10 bg-white/[0.03]",
                    )}
                  >
                    {highlighted && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-1 text-xs font-medium text-white shadow-lg shadow-violet-500/30">
                        Le plus populaire
                      </span>
                    )}
                    <div>
                      <h3 className="font-semibold text-white">{plan.name}</h3>
                      <p className="mt-2">
                        <span className="text-3xl font-bold tracking-tight text-white">
                          {formatPrice(plan.priceXof)}
                        </span>
                        {plan.priceXof > 0 && <span className="text-sm text-neutral-500"> / mois</span>}
                      </p>
                    </div>

                    <ul className="flex flex-1 flex-col gap-2.5 text-sm text-neutral-300">
                      {planFeatureLines(plan).map((line) => (
                        <li key={line} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-violet-300" />
                          {line}
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className={cn(
                        highlighted
                          ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-400"
                          : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
                      )}
                    >
                      <Link href={cta.href}>{cta.label}</Link>
                    </Button>
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
