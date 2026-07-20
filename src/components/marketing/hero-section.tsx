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
        className="pointer-events-none absolute top-[-10%] left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[120px]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
              <Sparkles className="size-3.5" />
              Prompteur + caméra, un seul appareil
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
              Créez vos vidéos sans{" "}
              <span className="bg-gradient-to-r from-violet-400 to-violet-200 bg-clip-text text-transparent">
                mémoriser vos scripts
              </span>
              .
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="max-w-xl text-lg text-pretty text-neutral-400 sm:text-xl">
              Lisez votre script et filmez votre vidéo en même temps, depuis votre téléphone,
              votre tablette ou votre ordinateur.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-violet-500 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-400"
              >
                <Link href="/studio">
                  Commencer gratuitement
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
              Aucune carte bancaire nécessaire · Utilisable directement dans votre navigateur.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div
            aria-hidden
            className="absolute inset-6 -z-10 rounded-full bg-violet-600/30 blur-[80px]"
          />
          <div className="relative aspect-square overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10">
            <Image
              src="/images/hero-recording.png"
              alt="Une personne filme une vidéo avec son téléphone sur trépied, le script PrompteurFlow défilant à l'écran pendant l'enregistrement."
              fill
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
