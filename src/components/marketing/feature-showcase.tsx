import {
  FileText,
  Filter,
  Layout,
  RefreshCw,
  Smartphone,
  Upload,
  WifiOff,
} from "lucide-react";

import { PrompterMockup } from "./mockup/prompter-mockup";
import { Reveal } from "./reveal";

const SECONDARY_FEATURES = [
  {
    icon: RefreshCw,
    title: "Le script avance à ton rythme",
    description: "Vitesse de défilement et taille du texte réglées comme tu veux.",
  },
  {
    icon: Smartphone,
    title: "Commence sur ton téléphone, continue sur ton ordinateur",
    description: "Le même outil, sur téléphone, tablette ou ordinateur.",
  },
  {
    icon: FileText,
    title: "Une prise ne te convient pas ?",
    description: "Recommence immédiatement — aucune prise n'est gravée dans le marbre.",
  },
  {
    icon: Upload,
    title: "Importe un script existant",
    description: "Fichier .txt, .docx ou .pdf, au lieu de tout retaper.",
  },
  {
    icon: Filter,
    title: "Change l'ambiance en un tap",
    description: "Chaud, froid, noir & blanc, cinéma — visibles dès l'enregistrement.",
  },
  {
    icon: WifiOff,
    title: "Continue même sans connexion",
    description: "Une fois chargée, l'application reste utilisable hors-ligne.",
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
            Tout ce qu&apos;il te faut pour enfin appuyer sur « Enregistrer ».
          </h2>
        </Reveal>

        {/* Fonctionnalité héro — le cœur du produit, mise en avant seule. */}
        <Reveal
          delay={0.05}
          className="border-brand/20 mt-12 grid items-center gap-8 overflow-hidden rounded-3xl border bg-gradient-to-br from-white/[0.04] to-transparent p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div>
            <div className="border-brand/25 bg-brand/10 flex size-11 items-center justify-center rounded-xl border">
              <Layout className="text-brand-bright size-5" />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-white">
              Lis ton script et filme avec le même appareil
            </h3>
            <p className="mt-3 max-w-md text-neutral-400">
              Pas besoin de jongler entre plusieurs outils, ni de synchroniser quoi que ce soit
              après coup. Tu regardes la caméra, ton texte défile, tu enregistres.
            </p>
          </div>
          <div className="mx-auto w-full max-w-[220px]">
            <PrompterMockup />
          </div>
        </Reveal>

        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
          {SECONDARY_FEATURES.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 0.04} className="bg-neutral-950 p-6">
              <Icon className="text-brand-bright size-5" />
              <h3 className="mt-3 text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-xs text-pretty text-neutral-400">{description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
