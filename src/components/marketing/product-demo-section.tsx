import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PrompterMockup } from "./mockup/prompter-mockup";

export function ProductDemoSection() {
  return (
    <section id="demo" className="bg-muted/30 border-t">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Regardez comment ça fonctionne.
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg text-pretty">
          Le texte défile à l&apos;écran pendant que la caméra enregistre — vous restez concentré sur
          votre message, pas sur votre mémoire.
        </p>

        <div className="mx-auto mt-12 max-w-xs">
          <PrompterMockup />
        </div>

        <Button asChild size="lg" className="mt-10 gap-2">
          <Link href="/studio">
            Essayer maintenant
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
