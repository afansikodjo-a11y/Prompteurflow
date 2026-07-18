import { Clapperboard, FileText, SlidersHorizontal, Upload } from "lucide-react";

import { PrompterMockup } from "./mockup/prompter-mockup";

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
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:py-28 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Un seul outil pour passer de votre script à votre vidéo.
          </h2>
          <p className="text-muted-foreground text-lg text-pretty">
            Plus besoin de choisir entre mémoriser votre texte et rester naturel face à la caméra.
          </p>
        </div>

        <ol className="flex flex-col gap-6">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="flex items-start gap-4">
              <div className="border-border bg-card flex size-10 shrink-0 items-center justify-center rounded-full border">
                <Icon className="text-foreground size-4.5" />
              </div>
              <div>
                <p className="font-semibold">
                  <span className="text-muted-foreground mr-1.5">{index + 1}.</span>
                  {title}
                </p>
                <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-auto w-full max-w-xs">
        <PrompterMockup
          recording={false}
          lines={["Étape 1 : préparez votre script.", "Étape 2 : ajustez le prompteur.", "Étape 3 : filmez.", "Étape 4 : publiez."]}
        />
      </div>
    </section>
  );
}
