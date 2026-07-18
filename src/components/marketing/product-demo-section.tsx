import Link from "next/link";
import { ArrowRight, RefreshCw, ScanEye, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PrompterMockup } from "./mockup/prompter-mockup";
import { Reveal } from "./reveal";

const CALLOUTS = [
  { icon: ScanEye, label: "Script à l'écran", position: "top-10 -left-4 sm:-left-16" },
  { icon: RefreshCw, label: "Défilement synchronisé", position: "top-1/2 -right-4 sm:-right-20" },
  { icon: SlidersHorizontal, label: "Filtres en direct", position: "bottom-14 -left-2 sm:-left-24" },
];

export function ProductDemoSection() {
  return (
    <section id="demo" className="relative overflow-hidden border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/15 blur-[130px]"
      />
      <div className="mx-auto max-w-4xl px-4 text-center">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Regardez comment ça fonctionne.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-neutral-400">
            Le texte défile à l&apos;écran pendant que la caméra enregistre — vous restez
            concentré sur votre message, pas sur votre mémoire.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto mt-14 max-w-xs">
          <PrompterMockup glow />
          {CALLOUTS.map(({ icon: Icon, label, position }) => (
            <div
              key={label}
              className={`absolute hidden items-center gap-2 rounded-full border border-white/10 bg-neutral-900/90 px-3 py-2 text-xs font-medium text-neutral-200 shadow-xl backdrop-blur sm:flex ${position}`}
            >
              <Icon className="size-3.5 text-violet-300" />
              {label}
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.15}>
          <Button
            asChild
            size="lg"
            className="mt-14 gap-2 bg-violet-500 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-400"
          >
            <Link href="/studio">
              Essayer maintenant
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
