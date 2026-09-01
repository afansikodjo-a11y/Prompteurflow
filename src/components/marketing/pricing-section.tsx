"use client";

import { PricingCards, type Plan } from "@/features/subscription";
import { Reveal } from "./reveal";

interface PricingSectionProps {
  plans: Plan[];
}

export function PricingSection({ plans }: PricingSectionProps) {
  return (
    <section id="pricing" className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Choisissez votre formule</h2>
          <p className="mt-4 text-lg text-pretty text-neutral-400">
            Deux formules simples, sans engagement — choisissez celle qui vous correspond.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <PricingCards plans={plans} />
        </Reveal>
      </div>
    </section>
  );
}
