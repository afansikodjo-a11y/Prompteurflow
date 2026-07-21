import { ChevronDown } from "lucide-react";

import { Reveal } from "./reveal";

const FAQS = [
  {
    q: "Dois-je utiliser un deuxième téléphone ?",
    a: "Non. Prompteur Flow te permet de lire ton script et d'enregistrer ta vidéo avec le même appareil.",
  },
  {
    q: "Est-ce que ça fonctionne sur téléphone, tablette et ordinateur ?",
    a: "Oui, directement dans ton navigateur, sur les trois.",
  },
  {
    q: "Je ne suis pas à l'aise devant une caméra. Est-ce que c'est pour moi ?",
    a: "Oui. Tu n'as plus besoin de mémoriser chaque phrase — ton script t'accompagne pendant l'enregistrement.",
  },
  {
    q: "Puis-je refaire une prise ?",
    a: "Oui. Une prise ne te convient pas ? Tu peux recommencer immédiatement.",
  },
  {
    q: "Est-ce adapté aux vidéos TikTok, Reels et YouTube ?",
    a: "Oui.",
  },
  {
    q: "Puis-je utiliser mes propres scripts ?",
    a: "Oui. Écris-les directement dans l'application, ou importe un fichier existant (.txt, .docx, .pdf).",
  },
  {
    q: "Je n'ai pas d'idée de script. L'IA peut l'écrire pour moi ?",
    a: "Oui. Donne un sujet à l'assistant IA intégré, il rédige un script complet — ou améliore un texte que tu as déjà écrit (le raccourcir, le reformuler, corriger la grammaire...).",
  },
  {
    q: "Mes vidéos sont-elles envoyées sur un serveur ?",
    a: "Non. Elles restent stockées sur ton appareil ; tu choisis toi-même quand les télécharger.",
  },
  {
    q: "Puis-je essayer avant de m'engager ?",
    a: "Oui, sans carte bancaire et sans création de compte.",
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
