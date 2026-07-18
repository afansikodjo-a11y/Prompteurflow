import { Clapperboard, FileText, SlidersHorizontal, Upload } from "lucide-react";

import { PrompterMockup } from "./mockup/prompter-mockup";
import { Reveal } from "./reveal";

const STEPS = [
  {
    icon: FileText,
    title: "Préparez votre script",
    description: "Écrivez-le directement dans l'application ou importez un fichier .txt existant.",
  },
  {
    icon: SlidersHorizontal,
    title: "Ajustez le prompteur",
    description: "Taille du texte, vitesse de défilement, mode miroir — réglés à votre rythme.",
  },
  {
    icon: Clapperboard,
    title: "Filmez directement",
    description: "Le script défile pendant que la caméra enregistre. Un seul appareil, aucun jonglage.",
  },
  {
    icon: Upload,
    title: "Publiez votre vidéo",
    description: "Téléchargez le clip et partagez-le où vous voulez.",
  },
];

export function SolutionSection() {
  return (
    <section className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-8">
          <Reveal className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Un seul outil pour passer de votre script à votre vidéo.
            </h2>
            <p className="text-lg text-pretty text-neutral-400">
              Plus besoin de choisir entre mémoriser votre texte et rester naturel face à la
              caméra.
            </p>
          </Reveal>

          <ol className="flex flex-col gap-6">
            {STEPS.map(({ icon: Icon, title, description }, index) => (
              <Reveal key={title} delay={index * 0.06}>
                <li className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10">
                    <Icon className="size-4.5 text-violet-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      <span className="mr-1.5 text-neutral-500">{index + 1}.</span>
                      {title}
                    </p>
                    <p className="mt-0.5 text-sm text-neutral-400">{description}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={0.1} className="mx-auto w-full max-w-xs">
          <PrompterMockup
            recording={false}
            lines={[
              "Étape 1 : préparez votre script.",
              "Étape 2 : ajustez le prompteur.",
              "Étape 3 : filmez.",
              "Étape 4 : publiez.",
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}
