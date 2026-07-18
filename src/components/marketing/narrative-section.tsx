import { ArrowRight, Check, X } from "lucide-react";

import { Reveal } from "./reveal";

const BEFORE = [
  "Vous oubliez votre texte au pire moment",
  "Vous regardez ailleurs que l'objectif",
  "Vous recommencez, encore et encore",
  "Vous perdez un temps précieux à chaque prise",
];

const AFTER = [
  "Votre script reste sous les yeux, jamais mémorisé",
  "Votre regard reste dirigé vers la caméra",
  "Votre présentation devient fluide dès la première prise",
  "Votre vidéo est prête beaucoup plus vite",
];

/**
 * Narration Avant/Avec — fusionne ce qui était deux sections séparées
 * (problème + comparaison) : la répétition n'ajoutait rien, une seule
 * transformation visuelle raconte mieux l'histoire.
 */
export function NarrativeSection() {
  return (
    <section className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Une idée de vidéo ne devrait jamais rester dans votre tête.
          </h2>
          <p className="mt-4 text-lg text-pretty text-neutral-400">
            Le problème n&apos;est pas que vous ne savez pas parler — c&apos;est que vous essayez
            de faire deux choses en même temps : vous souvenir de votre texte, et rester naturel
            face à la caméra.
          </p>
        </Reveal>

        <div className="mt-14 grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <Reveal delay={0.05} className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-6">
            <p className="text-sm font-semibold text-red-400">Avant</p>
            <ul className="mt-4 flex flex-col gap-3.5">
              {BEFORE.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-300">
                  <X className="mt-0.5 size-4 shrink-0 text-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="hidden justify-center py-4 lg:flex">
            <div className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <ArrowRight className="size-4 text-violet-300" />
            </div>
          </div>

          <Reveal
            delay={0.1}
            className="rounded-2xl border border-violet-400/20 bg-violet-500/[0.05] p-6"
          >
            <p className="text-sm font-semibold text-violet-300">Avec PrompteurFlow</p>
            <ul className="mt-4 flex flex-col gap-3.5">
              {AFTER.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-200">
                  <Check className="mt-0.5 size-4 shrink-0 text-violet-300" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
