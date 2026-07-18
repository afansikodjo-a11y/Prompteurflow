import { LaptopFrame, PhoneFrame, TabletFrame } from "./mockup/device-frames";
import { PrompterMockup } from "./mockup/prompter-mockup";

const DEVICES = [
  {
    frame: PhoneFrame,
    title: "Téléphone",
    description: "Filmez vos vidéos où que vous soyez, avec l'appareil que vous avez déjà en poche.",
    mockupClassName: "rounded-none",
  },
  {
    frame: TabletFrame,
    title: "Tablette",
    description: "Profitez d'un écran plus grand pour lire confortablement votre script en filmant.",
    mockupClassName: "rounded-none",
  },
  {
    frame: LaptopFrame,
    title: "Ordinateur",
    description: "Préparez et enregistrez vos présentations, formations ou visioconférences depuis votre bureau.",
    mockupClassName: "aspect-video rounded-none",
  },
];

export function DeviceShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Créez sur l&apos;appareil qui vous convient.
        </h2>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">
          PrompteurFlow fonctionne directement dans votre navigateur — le même prompteur, la même
          caméra, sur téléphone, tablette ou ordinateur.
        </p>
      </div>

      <div className="mt-16 grid gap-12 sm:grid-cols-3 sm:items-end sm:gap-8">
        {DEVICES.map(({ frame: Frame, title, description, mockupClassName }) => (
          <div key={title} className="flex flex-col items-center gap-6 text-center">
            <Frame className="max-w-[180px] sm:max-w-none">
              <PrompterMockup showFilters={false} recording={false} className={mockupClassName} />
            </Frame>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-1 text-sm text-pretty">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
