import { FileText, Filter, Layers, Layout, Smartphone, Upload, WifiOff } from "lucide-react";

import { PrompterMockup } from "./mockup/prompter-mockup";
import { Reveal } from "./reveal";

const SECONDARY_FEATURES = [
  {
    icon: FileText,
    title: "Gestion de scripts",
    description: "Créez, renommez et organisez tous vos textes au même endroit.",
  },
  {
    icon: Upload,
    title: "Import de fichier",
    description: "Importez un script existant (.txt) au lieu de tout retaper.",
  },
  {
    icon: Filter,
    title: "Filtres vidéo",
    description: "Chaud, froid, noir & blanc, cinéma — visibles dès l'enregistrement.",
  },
  {
    icon: Layers,
    title: "Caméra avant/arrière",
    description: "Basculez de caméra et activez le mode miroir en un tap.",
  },
  {
    icon: WifiOff,
    title: "Fonctionne hors-ligne",
    description: "Une fois chargée, l'application reste utilisable sans connexion.",
  },
  {
    icon: Smartphone,
    title: "Multi-appareil",
    description: "Téléphone, tablette ou ordinateur — la même expérience partout.",
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Tout ce qu&apos;il faut, rien de superflu.
          </h2>
        </Reveal>

        {/* Fonctionnalité héro — le cœur du produit, mise en avant seule. */}
        <Reveal
          delay={0.05}
          className="mt-12 grid items-center gap-8 overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] to-transparent p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div>
            <div className="flex size-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
              <Layout className="size-5 text-violet-300" />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-white">
              Prompteur et caméra, sur un seul appareil
            </h3>
            <p className="mt-3 max-w-md text-neutral-400">
              Vitesse de défilement et taille du texte réglées à votre rythme, enregistrement
              intégré — pas besoin de jongler entre plusieurs outils ni de synchroniser quoi que
              ce soit après coup.
            </p>
          </div>
          <div className="mx-auto w-full max-w-[220px]">
            <PrompterMockup />
          </div>
        </Reveal>

        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
          {SECONDARY_FEATURES.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 0.04} className="bg-neutral-950 p-6">
              <Icon className="size-5 text-violet-300" />
              <h3 className="mt-3 text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-xs text-pretty text-neutral-400">{description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
