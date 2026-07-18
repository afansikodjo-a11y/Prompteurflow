import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="bg-muted/30 border-t">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:py-28">
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Vous avez une idée de vidéo ? Il ne vous reste plus qu&apos;à la filmer.
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-lg text-pretty">
          Écrivez votre script. Ouvrez votre prompteur. Appuyez sur enregistrer.
        </p>
        <Button asChild size="lg" className="mt-8 gap-2">
          <Link href="/studio">
            Commencer maintenant
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
