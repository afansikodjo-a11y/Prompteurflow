import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PrompterMockup } from "./mockup/prompter-mockup";

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col items-start gap-6">
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Créez vos vidéos sans mémoriser vos scripts.
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg text-pretty sm:text-xl">
          Lisez votre script et filmez votre vidéo en même temps, depuis votre téléphone, votre
          tablette ou votre ordinateur.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button asChild size="lg" className="gap-2">
            <Link href="/studio">
              Commencer gratuitement
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link href="#demo">
              <PlayCircle className="size-4" />
              Voir comment ça marche
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Aucune carte bancaire nécessaire · Utilisable directement dans votre navigateur.
        </p>
      </div>

      <div className="mx-auto w-full max-w-xs lg:max-w-sm">
        <PrompterMockup />
      </div>
    </section>
  );
}
