import { ChevronDown } from "lucide-react";

import { Reveal } from "./reveal";

const FAQS = [
  {
    q: "Dois-je mémoriser mon script ?",
    a: "Non. Votre texte s'affiche à l'écran et défile pendant que vous filmez.",
  },
  {
    q: "Puis-je utiliser l'application sur téléphone, tablette ou ordinateur ?",
    a: "Oui. PrompteurFlow fonctionne directement dans votre navigateur, sur les trois.",
  },
  {
    q: "Ai-je besoin d'un deuxième appareil ?",
    a: "Non. Un seul appareil sert à la fois de prompteur et de caméra.",
  },
  {
    q: "Est-ce adapté aux débutants ?",
    a: "Oui. Si vous savez utiliser la caméra de votre appareil, vous pouvez commencer immédiatement.",
  },
  {
    q: "Puis-je utiliser mes propres scripts ?",
    a: "Oui. Écrivez-les directement dans l'application, ou importez un fichier .txt (plans Standard et Pro).",
  },
  {
    q: "Mes vidéos sont-elles envoyées sur un serveur ?",
    a: "Non. Elles restent stockées sur votre appareil ; vous choisissez vous-même quand les télécharger.",
  },
  {
    q: "Puis-je essayer avant de m'engager ?",
    a: "Oui. Le plan Basique est utilisable gratuitement, sans carte bancaire et sans création de compte.",
  },
];

/** Accordéon natif (`<details>`) — accessible et sans JS, pas de composant client nécessaire. */
export function FaqSection() {
  return (
    <section id="faq" className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Questions fréquentes
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="mt-10 flex flex-col divide-y divide-white/[0.06] border-t border-b border-white/[0.06]">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown className="size-4 shrink-0 text-neutral-500 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-pretty text-neutral-400">{a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
