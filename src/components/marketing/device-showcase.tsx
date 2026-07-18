import { LaptopFrame, PhoneFrame, TabletFrame } from "./mockup/device-frames";
import { PrompterMockup } from "./mockup/prompter-mockup";
import { Reveal } from "./reveal";

const DEVICES = [
  {
    frame: PhoneFrame,
    title: "Téléphone",
    description: "Filmez vos vidéos où que vous soyez, avec l'appareil que vous avez déjà en poche.",
    mockupClassName: "rounded-none",
    offsetClassName: "lg:mt-10",
  },
  {
    frame: TabletFrame,
    title: "Tablette",
    description: "Profitez d'un écran plus grand pour lire confortablement votre script en filmant.",
    mockupClassName: "rounded-none",
    offsetClassName: "",
  },
  {
    frame: LaptopFrame,
    title: "Ordinateur",
    description: "Préparez et enregistrez vos présentations, formations ou visioconférences depuis votre bureau.",
    mockupClassName: "aspect-video rounded-none",
    offsetClassName: "lg:mt-10",
  },
];

export function DeviceShowcase() {
  return (
    <section className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Créez sur l&apos;appareil qui vous convient.
          </h2>
          <p className="mt-4 text-lg text-pretty text-neutral-400">
            PrompteurFlow fonctionne directement dans votre navigateur — le même prompteur, la
            même caméra, sur téléphone, tablette ou ordinateur.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-12 sm:grid-cols-3 sm:items-end sm:gap-8">
          {DEVICES.map(({ frame: Frame, title, description, mockupClassName, offsetClassName }, index) => (
            <Reveal
              key={title}
              delay={index * 0.08}
              className={`flex flex-col items-center gap-6 text-center ${offsetClassName}`}
            >
              <Frame className="max-w-[180px] sm:max-w-none">
                <PrompterMockup showFilters={false} recording={false} className={mockupClassName} />
              </Frame>
              <div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm text-pretty text-neutral-400">{description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
