import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Halo d'ambiance en fond de scène — fixe, pas un asset. */}
      <div
        aria-hidden
        className="bg-brand/15 pointer-events-none absolute top-[-10%] left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-[120px]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <Reveal>
            <span className="border-brand/30 bg-brand/10 text-brand-bright inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
              <Sparkles className="size-3.5" />
              Ton script, ta caméra, un seul appareil
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ton script.
              <br />
              Ta caméra.
              <br />
              <span className="text-brand-bright">Un seul appareil.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="max-w-xl text-lg text-pretty text-neutral-400 sm:text-xl">
              Lis ton script et enregistre directement ta vidéo avec ton téléphone, ta tablette
              ou ton ordinateur. Sans mémoriser. Sans deuxième appareil.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-brand shadow-brand/30 hover:bg-brand-bright gap-2 text-black shadow-lg"
              >
                <Link href="/studio">
                  Créer ma première vidéo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                <Link href="#demo">
                  <PlayCircle className="size-4" />
                  Voir comment ça marche
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-sm text-neutral-500">
              Téléphone · Tablette · Ordinateur — pas de deuxième appareil, pas de mémorisation
              obligatoire.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div aria-hidden className="bg-brand/25 absolute inset-6 -z-10 rounded-full blur-[80px]" />
          <div className="relative aspect-square overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10">
            <Image
              src="/images/teleprompter.gif"
              alt="Une personne filme une vidéo avec son téléphone sur trépied, le script PrompteurFlow défilant à l'écran pendant l'enregistrement."
              fill
              unoptimized
              priority
              sizes="(min-width: 1024px) 448px, (min-width: 640px) 384px, 90vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
