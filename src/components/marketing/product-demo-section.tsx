import Link from "next/link";
import { ArrowRight, ArrowDown, Camera, Clapperboard, FileText, RefreshCw, ScanEye, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PrompterMockup } from "./mockup/prompter-mockup";
import { Reveal } from "./reveal";

const FLOW = [
  { icon: FileText, label: "Script" },
  { icon: ScanEye, label: "Prompteur" },
  { icon: Camera, label: "Caméra" },
  { icon: Clapperboard, label: "Vidéo enregistrée" },
];

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
        className="bg-brand/15 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
      />
      <div className="mx-auto max-w-4xl px-4 text-center">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Regarde. Tu lis. Tu enregistres. C&apos;est tout.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-neutral-400">
            Pas besoin de mémoriser ton texte. Pas besoin d&apos;un deuxième téléphone.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto mt-10 flex max-w-md flex-wrap items-center justify-center gap-2 sm:flex-nowrap">
          {FLOW.map(({ icon: Icon, label }, index) => (
            <div key={label} className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-neutral-200">
                <Icon className="text-brand-bright size-3.5" />
                {label}
              </span>
              {index < FLOW.length - 1 && (
                <ArrowRight className="hidden size-3.5 shrink-0 text-neutral-600 sm:block" />
              )}
              {index < FLOW.length - 1 && (
                <ArrowDown className="size-3.5 shrink-0 text-neutral-600 sm:hidden" />
              )}
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.12} className="relative mx-auto mt-10 max-w-xs">
          <PrompterMockup glow />
          {CALLOUTS.map(({ icon: Icon, label, position }) => (
            <div
              key={label}
              className={`absolute hidden items-center gap-2 rounded-full border border-white/10 bg-neutral-900/90 px-3 py-2 text-xs font-medium text-neutral-200 shadow-xl backdrop-blur sm:flex ${position}`}
            >
              <Icon className="text-brand-bright size-3.5" />
              {label}
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.16}>
          <Button
            asChild
            size="lg"
            className="bg-brand shadow-brand/30 hover:bg-brand-bright mt-14 gap-2 text-black shadow-lg"
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
