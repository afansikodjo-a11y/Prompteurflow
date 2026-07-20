import { Camera, Clapperboard, FileText } from "lucide-react";

import { PrompterMockup } from "./mockup/prompter-mockup";
import { Reveal } from "./reveal";

const STEPS = [
  {
    icon: FileText,
    title: "Écris ton script",
    description: "Prépare exactement ce que tu veux dire.",
  },
  {
    icon: Camera,
    title: "Lance la caméra",
    description: "Ton script défile devant toi pendant que tu enregistres.",
  },
  {
    icon: Clapperboard,
    title: "Crée ta vidéo",
    description: "Une prise. Une vidéo. Prête à être publiée.",
  },
];

export function SolutionSection() {
  return (
    <section className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-8">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              De ton idée à ta vidéo. Sans détour.
            </h2>
          </Reveal>

          <ol className="relative flex flex-col gap-8">
            <div aria-hidden className="absolute top-2 bottom-2 left-5 w-px bg-white/10" />
            {STEPS.map(({ icon: Icon, title, description }, index) => (
              <Reveal key={title} delay={index * 0.08}>
                <li className="relative flex items-start gap-4">
                  <div className="border-brand/30 bg-brand/10 relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border">
                    <Icon className="text-brand-bright size-4.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      <span className="text-brand-bright mr-1.5">{index + 1}.</span>
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
            lines={["Étape 1 : écris ton script.", "Étape 2 : lance la caméra.", "Étape 3 : crée ta vidéo."]}
          />
        </Reveal>
      </div>
    </section>
  );
}
