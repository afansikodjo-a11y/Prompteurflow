import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div
        aria-hidden
        className="bg-brand/20 pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 translate-y-1/2 rounded-full blur-[120px]"
      />
      <Reveal className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
          Ta prochaine vidéo est déjà dans ta tête.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-pretty text-neutral-400">
          Écris ton script. Appuie sur enregistrer. Et donne vie à ton idée.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-brand shadow-brand/30 hover:bg-brand-bright mt-8 gap-2 text-black shadow-lg"
        >
          <Link href="/studio">
            Créer ma première vidéo
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </Reveal>
    </section>
  );
}
