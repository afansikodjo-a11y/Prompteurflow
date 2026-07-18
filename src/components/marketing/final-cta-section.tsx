import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 translate-y-1/2 rounded-full bg-violet-700/20 blur-[120px]"
      />
      <Reveal className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
          Vous avez une idée de vidéo ? Il ne vous reste plus qu&apos;à la filmer.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-pretty text-neutral-400">
          Écrivez votre script. Ouvrez votre prompteur. Appuyez sur enregistrer.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 gap-2 bg-violet-500 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-400"
        >
          <Link href="/studio">
            Commencer maintenant
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </Reveal>
    </section>
  );
}
