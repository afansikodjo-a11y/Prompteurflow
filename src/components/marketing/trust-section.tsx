import { Lock, Smartphone, WifiOff } from "lucide-react";

import { Reveal } from "./reveal";

const POINTS = [
  {
    icon: Lock,
    title: "Tes vidéos restent chez toi",
    description: "Tes enregistrements sont stockés directement sur ton appareil, pas sur un serveur.",
  },
  {
    icon: WifiOff,
    title: "Fonctionne hors-ligne",
    description: "Une fois l'application chargée, plus besoin de connexion pour l'utiliser.",
  },
  {
    icon: Smartphone,
    title: "Aucun compte requis pour essayer",
    description: "Ouvre l'application et commence à filmer immédiatement.",
  },
];

export function TrustSection() {
  return (
    <section className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <Reveal>
          <p className="text-center text-2xl font-bold tracking-tight text-balance text-white sm:text-3xl">
            Ton contenu. Tes scripts. Tes vidéos. Ta propriété.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {POINTS.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 0.06} className="flex flex-col items-center gap-3 text-center">
              <div className="border-brand/25 bg-brand/10 flex size-11 items-center justify-center rounded-full border">
                <Icon className="text-brand-bright size-5" />
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
