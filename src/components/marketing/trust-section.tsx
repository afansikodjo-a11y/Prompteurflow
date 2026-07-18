import { Lock, Smartphone, WifiOff } from "lucide-react";

import { Reveal } from "./reveal";

const POINTS = [
  {
    icon: Lock,
    title: "Vos vidéos restent chez vous",
    description: "Vos enregistrements sont stockés directement sur votre appareil, pas sur un serveur.",
  },
  {
    icon: WifiOff,
    title: "Fonctionne hors-ligne",
    description: "Une fois l'application chargée, plus besoin de connexion pour l'utiliser.",
  },
  {
    icon: Smartphone,
    title: "Aucun compte requis pour essayer",
    description: "Ouvrez l'application et commencez à filmer immédiatement.",
  },
];

export function TrustSection() {
  return (
    <section className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <Reveal>
          <p className="text-center text-2xl font-bold tracking-tight text-balance text-white sm:text-3xl">
            Votre contenu vous appartient.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {POINTS.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 0.06} className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <Icon className="size-5 text-violet-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs text-pretty text-neutral-400">{description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
