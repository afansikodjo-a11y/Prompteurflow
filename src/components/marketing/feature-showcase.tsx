import {
  Camera,
  FileText,
  Filter,
  Layers,
  SlidersHorizontal,
  Smartphone,
  Upload,
  WifiOff,
} from "lucide-react";

const FEATURES = [
  {
    icon: SlidersHorizontal,
    title: "Prompteur réglable",
    description: "Vitesse de défilement et taille du texte ajustées à votre rythme.",
  },
  {
    icon: Camera,
    title: "Enregistrement intégré",
    description: "Filmez directement depuis l'application, sans jongler entre plusieurs outils.",
  },
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
    description: "Chaud, froid, noir & blanc, cinéma — appliqués en direct, visibles à l'enregistrement.",
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
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tout ce qu&apos;il faut, rien de superflu.
        </h2>
      </div>
      <div className="bg-border mt-12 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="bg-card p-6">
            <Icon className="size-5" />
            <h3 className="mt-3 text-sm font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-1.5 text-xs text-pretty">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
