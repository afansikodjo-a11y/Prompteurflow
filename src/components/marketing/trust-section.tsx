import { Lock, Smartphone, WifiOff } from "lucide-react";

const POINTS = [
  {
    icon: Lock,
    title: "Vos vidéos restent chez vous",
    description: "Vos enregistrements sont stockés directement sur votre appareil, pas sur un serveur.",
  },
  {
    icon: WifiOff,
    title: "Fonctionne hors-ligne",
    description: "Une fois l'application chargée, plus besoin de connexion pour l'utiliser.",
  },
  {
    icon: Smartphone,
    title: "Aucun compte requis pour essayer",
    description: "Ouvrez l'application et commencez à filmer immédiatement.",
  },
];

export function TrustSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-8 sm:grid-cols-3">
        {POINTS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-center gap-3 text-center">
            <div className="border-border flex size-11 items-center justify-center rounded-full border">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-muted-foreground mt-1 text-xs text-pretty">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
